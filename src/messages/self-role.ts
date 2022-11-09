import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild } from 'discord.js';
import { util } from '..';
import { MessageBuilder } from '../interfaces';
import RoleCategory from '../components/buttons/role-category';

export const selfRoleSettings: MessageBuilder = {
    embeds: [new EmbedBuilder().setTitle(`Would you like to view, edit, or create a category?`)],
    components: [],
    async build(client, guild: Guild) {
        const categories = (await client.database.guildSettings.get(guild.id))?.selfRoles?.categories;
        this.components = [
            new ActionRowBuilder<ButtonBuilder>().addComponents([
                await RoleCategory.build(client, 'view'),
                await RoleCategory.build(client, 'edit'),
                await RoleCategory.build(client, 'create')
            ]),
            new ActionRowBuilder<ButtonBuilder>().addComponents([
                new ButtonBuilder().setCustomId('send-role-message').setLabel('Send Role Message').setStyle(ButtonStyle.Primary).setEmoji('📨')
            ])
        ];

        const color = util.Color;

        this.embeds[0].setColor(await color.getGuildColor(guild));

        if (categories && categories.length > 0) this.embeds[0].setDescription(`**Categories:**\n${categories.map(c => c.name).join(', ')}`);

        return {
            embeds: this.embeds,
            components: this.components
        };
    }
};
