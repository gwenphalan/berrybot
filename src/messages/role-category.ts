import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, Guild } from 'discord.js';
import { util } from '..';
import { MessageBuilder } from '../interfaces';
import EditButtons from '../components/buttons/category-edit';
import EditButton from '../components/buttons/role-category';

export const RoleCategory: MessageBuilder = {
    embeds: [],
    components: [],
    async build(client, guild: Guild, action: 'view' | 'edit', category: string) {
        const c = (await client.database.guildSettings.get(guild.id))?.selfRoles?.categories.find(c => c.name === category);

        const embed = new EmbedBuilder().setTitle(`Self Roles - ${category}`).setColor(await util.Color.getGuildColor(guild));

        if (!c) embed.setDescription(`This category does not exist.`);
        else
            embed.setFields([
                {
                    name: 'Name',
                    value: c.name,
                    inline: true
                },
                {
                    name: 'Emoji',
                    value: c.emoji,
                    inline: true
                },
                {
                    name: 'Roles',
                    value: c.roles?.length > 0 ? c.roles.map(role => `<@&${role}>`).join(', ') : 'None'
                }
            ]);

        const row = new ActionRowBuilder<ButtonBuilder>();

        if (action === 'edit')
            row.addComponents([
                await EditButtons.build(client, 'name', category),
                await EditButtons.build(client, 'emoji', category),
                await EditButtons.build(client, 'roles', category),
                await EditButtons.build(client, 'delete', category)
            ]);
        else row.addComponents([await EditButton.build(client, action, category)]);

        this.embeds.push(embed);

        return {
            embeds: this.embeds,
            components: this.components
        };
    }
};
