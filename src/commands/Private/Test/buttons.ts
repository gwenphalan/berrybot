import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../../interfaces';

const command: Command = {
    subCommand: 'test.buttons',
    async execute(interaction: ChatInputCommandInteraction, client) {
        // Return if the interaction wasn't used in a guild.
        if (!interaction.guild) {
            return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
        }

        const testJSON = {
            boolean: true,
            number: 1,
            string: 'test',
            array: [1, 2, 3]
        };

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(await client.getCustomID('test-button', testJSON))
                .setLabel('Test Button')
                .setStyle(ButtonStyle.Primary)
        );

        return interaction.reply({ content: 'Test Button', components: [row] });
    }
};

module.exports = command;
