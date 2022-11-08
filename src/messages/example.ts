import * as discord from 'discord.js';
import { MessageBuilder } from '../interfaces';

export const example: MessageBuilder = {
    embeds: [new discord.EmbedBuilder().setTitle('Example').setDescription('This is an example message.')],
    components: [new discord.ActionRowBuilder<discord.ButtonBuilder>()],
    async build(client) {
        const testJSON = {
            boolean: true,
            number: 1,
            string: 'test',
            array: [1, 2, 3]
        };
        this.components[0].addComponents(
            new discord.ButtonBuilder().setCustomId(client.getCustomID('test-button', testJSON)).setLabel('Test Button').setStyle(discord.ButtonStyle.Primary)
        );
        return {
            embeds: this.embeds,
            components: this.components
        };
    },
};
