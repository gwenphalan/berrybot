import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild } from 'discord.js';
import { util } from '..';
import { MessageBuilder } from '../interfaces';

export const selfRoleSettings: MessageBuilder = {
    embeds: [new EmbedBuilder().setDescription(`Would you like to view, edit, or create a category?`)],
    components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder().setCustomId('role-category[{"action":"view"}]').setLabel('View').setStyle(ButtonStyle.Secondary).setEmoji('🔍'),
            new ButtonBuilder().setCustomId('role-category[{"action":"edit"}]').setLabel('Edit').setStyle(ButtonStyle.Secondary).setEmoji('✏️'),
            new ButtonBuilder().setCustomId('role-category[{"action":"create"}]').setLabel('Create').setStyle(ButtonStyle.Success).setEmoji('➕')
        ]),
        new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder().setCustomId('send-role-message').setLabel('Send Role Message').setStyle(ButtonStyle.Primary).setEmoji('📨')
        ])
    ],
    async build(_client, guild: Guild) {
        const color = util.Color;

        this.embeds[0].setColor(await color.getGuildColor(guild));
        return {
            embeds: this.embeds,
            components: this.components
        };
    }
};
