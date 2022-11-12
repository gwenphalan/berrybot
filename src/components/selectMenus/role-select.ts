import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, Guild, GuildMember, PermissionFlagsBits, SelectMenuBuilder } from 'discord.js';
import { util } from '../../bot';
import { SelfRoleCategory } from '../../database/schemas/GuildSettings';
import { ComponentTypes, SelectMenuComponent } from '../../interfaces/MessageComponent';
import { RoleMessage } from '../../messages/role-select';
import { RoleCategory } from '../../messages/role-category';

export const MessageComponent: SelectMenuComponent = {
    id: 'role-select',
    type: ComponentTypes.SelectMenu,
    multi_select: true,

    async build(client, guild: Guild, action: 'edit' | 'create' | 'assign', category: string, member?: GuildMember) {
        const data = {
            action: action,
            category: category
        };

        const guildRoles = guild.roles.cache.filter(r => !r.managed && r.editable && r.name !== '@everyone');

        const menu = new SelectMenuBuilder().setCustomId(client.getCustomID('role-select', data)).setPlaceholder('Select Roles');

        if (!guildRoles.size)
            return menu
                .setOptions([{ label: 'No roles to select', value: 'none' }])
                .setDisabled(true)
                .setPlaceholder('No roles to select');

        switch (action) {
            case 'create':
                menu.setOptions(guildRoles.map(r => ({ label: r.name, value: r.id })))
                    .setMinValues(1)
                    .setMaxValues(guildRoles.size);
                break;
            case 'edit':
                const c = (await client.database.guildSettings.get(guild.id)).selfRoles.categories.find(c => c.name === category);

                if (!c) return menu.setDisabled(true).setPlaceholder('This category has been deleted');

                menu.setOptions(guildRoles.map(r => ({ label: r.name, value: r.id, default: c.roles.includes(r.id) })))
                    .setMinValues(1)
                    .setMaxValues(guildRoles.size);
                break;
            case 'assign':
                const database = await client.database.guildSettings.get(guild.id);
                const _category = database.selfRoles?.categories?.find(c => c.name === category);

                if (!database || !database.selfRoles || !_category) return menu.setDisabled(true).setPlaceholder('No roles to select');

                const roles = guildRoles.filter(r => _category.roles?.includes(r.id));
                const memberRoles = guildRoles.filter(r => member?.roles.cache.has(r.id));

                if (!roles.size) return menu.setDisabled(true).setPlaceholder('No roles to select');

                menu.setOptions(roles.map(r => ({ label: r.name, value: r.id, default: memberRoles.has(r.id) })))
                    .setMinValues(0)
                    .setMaxValues(roles.size);
        }

        return menu;
    },

    async execute(interaction, client, selected, data: { action: 'edit' | 'create' | 'assign'; category: string }) {
        if (selected.length === 0 && data.action !== 'assign') return interaction.reply({ content: 'You must select at least one role.', ephemeral: true });

        if (!interaction.guild || !interaction.member) return;

        const member = interaction.guild?.members.cache.get(interaction.member.user.id);

        if (data.action !== 'assign' && member && !member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: 'You do not have permission to do this.', ephemeral: true });
        }

        const database = await client.database.guildSettings.get(interaction.guild.id);

        const guildRoles = interaction.guild.roles.cache.filter(r => !r.managed && r.editable && r.name !== '@everyone');
        const roles = guildRoles.filter(r => selected.find(s => s.value === r.id));

        switch (data.action) {
            case 'create':
                const create_category: SelfRoleCategory = {
                    name: data.category,
                    roles: roles.map(role => role.id),
                    emoji: '<:guildRole:1039520885327007804>'
                };
                if (!database.selfRoles) database.selfRoles = { categories: [create_category] };
                else if (!database.selfRoles.categories) database.selfRoles.categories = [create_category];
                else database.selfRoles.categories.push(create_category);

                await client.database.guildSettings.update(interaction.guild.id, database);

                await RoleMessage(client, interaction.guild);

                return interaction.reply(await RoleCategory.build(client, interaction.guild, 'edit', create_category.name));
            case 'edit':
                const edit_category = database.selfRoles?.categories?.find(c => c.name === data.category);

                if (!edit_category) return interaction.reply({ content: 'Category not found.', ephemeral: true });

                edit_category.roles = roles.map(role => role.id);

                if (database.selfRoles && database.selfRoles.categories)
                    database.selfRoles.categories = database.selfRoles.categories.map(c => (c.name === data.category ? edit_category : c));

                await client.database.guildSettings.update(interaction.guild.id, database);

                await RoleMessage(client, interaction.guild);

                return interaction.reply(await RoleCategory.build(client, interaction.guild, 'edit', edit_category.name));
            case 'assign':
                const embed = new EmbedBuilder().setTitle('Self Roles').setColor(await util.Color.getGuildColor(interaction.guild));

                const components: ActionRowBuilder<ButtonBuilder>[] = [];
                const assign_category = database.selfRoles?.categories?.find(c => c.name === data.category);

                if (!assign_category) return interaction.reply({ content: 'Category not found.', ephemeral: true });

                let addedRoles: string[] = [];
                let removedRoles: string[] = [];

                const member = await interaction.guild.members.fetch(interaction.user.id);

                assign_category.roles.forEach(async role => {
                    const r = guildRoles.find(r => r.id === role);

                    if (!r) return;

                    if (!roles.get(r.id) && member.roles.cache.has(role)) {
                        member.roles.remove(r);
                        removedRoles.push(r.toString());
                    } else if (roles.get(r.id) && !member.roles.cache.has(role)) {
                        member.roles.add(role);
                        addedRoles.push(r.toString());
                    }
                });

                embed.setTitle(`Self Roles - ${assign_category.name}`);
                if (roles.size) embed.setDescription(`${roles.map(r => r.toString()).join(', ')}`);

                if (removedRoles.length > 0) {
                    embed.addFields({
                        name: 'Removed',
                        value: ' • ' + removedRoles.join('\n • ')
                    });
                } else if (addedRoles.length > 0) {
                    embed.addFields({
                        name: 'Added',
                        value: ' • ' + addedRoles.join('\n • ')
                    });
                }

                return await interaction.update({ embeds: [embed], components: components });
        }
    }
};

export default MessageComponent;
