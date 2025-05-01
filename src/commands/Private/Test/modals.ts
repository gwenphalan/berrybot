import { SlashCommandSubcommandBuilder } from 'discord.js';
import { modals } from '../../../components';
import { Command } from '../../../interfaces';

const command: Command = {
    parent: 'test',
    data: new SlashCommandSubcommandBuilder()
        .setName('modals')
        .setDescription('Test modals'),
    async execute(interaction, _client) {
        // Return if the interaction wasn't used in a guild.
        if (!interaction.guild) {
            return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
        }

        const modal = await modals.TestModal.build(_client);

        return await interaction.showModal(modal);
    }
};

module.exports = command;
