import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild } from 'discord.js';
import { util } from '..';
import { MessageBuilder } from '../interfaces';
import RoleCategory from '../components/buttons/role-category';

export const selfRoleSettings: MessageBuilder = {
    embeds: [new EmbedBuilder().setDescription(`Would you like to view, edit, or create a category?`)],
    components: [],
    async build(client, guild: Guild) {
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
        return {
            embeds: this.embeds,
            components: this.components
        };
    }
};
