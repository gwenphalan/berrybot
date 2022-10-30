import { ActionRowBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Client } from '../../../interfaces/Client';
import { Command } from '../../../interfaces/command';

const command: Command = {
    subCommand: 'test.modals',
    async execute(interaction: ChatInputCommandInteraction, _client: Client) {
        console.log(`Creating modal...`);

        // Return if the interaction wasn't used in a guild.
        if (!interaction.guild) {
            console.log(`Interaction was not used in a guild!`);
            return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
        }

        const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder().setCustomId('test-modal-input').setPlaceholder('Test Input').setStyle(TextInputStyle.Short).setLabel('Test Input')
        );
        const modal = new ModalBuilder().setTitle('Test Modal').setCustomId('test-modal').setComponents([row]);

        console.log(`Sending modal...`);
        return interaction.showModal(modal);
    }
};

module.exports = command;
