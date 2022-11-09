import { EmbedBuilder, Guild, SelectMenuBuilder } from 'discord.js';
import { util } from '../..';
import { SelfRoleCategory } from '../../database/schemas/GuildSettings';
import { ComponentTypes, SelectMenuComponent } from '../../interfaces/MessageComponent';

export const MessageComponent: SelectMenuComponent = {
    id: 'role-select',
    type: ComponentTypes.SelectMenu,
    multi_select: true,

    async build(client, guild: Guild, action: 'edit' | 'create' | 'assign', category: string) {
        const data = {
            action: action,
            category: category
        };

        const guildRoles = guild.roles.cache.filter(r => !r.managed || r.editable || r.name !== '@everyone');

        const menu = new SelectMenuBuilder().setCustomId(client.getCustomID('role-select', data)).setPlaceholder('Select Roles');

        if (!guildRoles.size) return menu.setDisabled(true).setPlaceholder('No roles to select');

        switch (action) {
            case 'create' || 'edit':
                menu.setOptions(guildRoles.map(r => ({ label: r.name, value: r.id })));
                break;
            case 'assign':
                const database = await client.database.guildSettings.get(guild.id);
                const _category = database.selfRoles?.categories?.find(c => c.name === category);

                if (!database || !database.selfRoles || !_category) return menu.setDisabled(true).setPlaceholder('No roles to select');

                const roles = guildRoles.filter(r => _category.roles?.includes(r.id));

                if (!roles.size) return menu.setDisabled(true).setPlaceholder('No roles to select');

                menu.setOptions(roles.map(r => ({ label: r.name, value: r.id })));
        }

        return menu;
    },

    async execute(interaction, client, selected, data: { action: 'edit' | 'create' | 'assign'; category: string }) {
        if (selected.length === 0) return interaction.reply({ content: 'You must select at least one role.', ephemeral: true });

        if (!interaction.guild) return;

        const database = await client.database.guildSettings.get(interaction.guild.id);

        const guildRoles = interaction.guild.roles.cache.filter(r => !r.managed || r.editable || r.name !== '@everyone');
        const roles = guildRoles.filter(r => selected.find(s => s.value === r.id));

        const embed = new EmbedBuilder().setTitle('Self Roles').setColor(await util.Color.getGuildColor(interaction.guild));

        switch (data.action) {
            case 'create':
                const create_category: SelfRoleCategory = {
                    name: data.category,
                    roles: roles.map(role => role.id),
                    emoji: '1039520946073116693'
                };
                if (!database.selfRoles) database.selfRoles = { categories: [create_category] };
                else if (!database.selfRoles.categories) database.selfRoles.categories = [create_category];
                else database.selfRoles.categories.push(create_category);

                await client.database.guildSettings.update(interaction.guild.id, database);

                embed.setDescription(`Created ${create_category.name} role category`);
                break;
            case 'edit':
                const edit_category = database.selfRoles?.categories?.find(c => c.name === data.category);

                if (!edit_category) return interaction.reply({ content: 'Category not found.', ephemeral: true });

                edit_category.roles = roles.map(role => role.id);

                if (database.selfRoles && database.selfRoles.categories)
                    database.selfRoles.categories = database.selfRoles.categories.map(c => (c.name === data.category ? edit_category : c));

                await client.database.guildSettings.update(interaction.guild.id, database);

                embed.setDescription(`Updated roles in the ${edit_category.name} category`);
                break;
            case 'assign':
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
                        removedRoles.push(role.toString());
                    } else if (roles.get(r.id) && !member.roles.cache.has(role)) {
                        member.roles.add(role);
                        addedRoles.push(role.toString());
                    }
                });

                embed.setTitle(`Self Roles - ${assign_category.name}`).setDescription(
                    `${member.roles.cache
                        .filter(role => roles.get(role.id))
                        .map(role => role.toString())
                        .join(', ')}`
                );

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
                break;
        }

        return await interaction.reply({ embeds: [embed] });
    }
};

export default MessageComponent;
