import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { MessageBuilder } from '../interfaces';

export const example: MessageBuilder = {
    embeds: [new EmbedBuilder().setTitle('Example').setDescription('This is an example message.')],
    components: [new ActionRowBuilder<ButtonBuilder>()],
    async build(client) {
        const testJSON = {
            boolean: true,
            number: 1,
            string: 'test',
            array: [1, 2, 3]
        };
        this.components[0].addComponents(
            new ButtonBuilder().setCustomId(client.getCustomID('test-button', testJSON)).setLabel('Test Button').setStyle(ButtonStyle.Primary)
        );
        return {
            embeds: this.embeds,
            components: this.components
        };
    },
};
