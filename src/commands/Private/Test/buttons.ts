import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from 'discord.js';
import { Client } from '../../../interfaces/Client';
import { Command } from '../../../interfaces/command';

const command: Command = {
    subCommand: 'test.buttons',
    async execute(interaction: ChatInputCommandInteraction, _client: Client) {
        // Return if the interaction wasn't used in a guild.
        if (!interaction.guild) {
            return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
        }

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('role-category-back["test"]').setLabel('Test Button').setStyle(ButtonStyle.Primary)
        );

        return interaction.reply({ content: 'Test Button', components: [row] });
    }
};

module.exports = command;
