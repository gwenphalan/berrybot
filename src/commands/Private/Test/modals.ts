import { SlashCommandSubcommandBuilder } from 'discord.js';
import { modals } from '../../../components';
import { Command } from '../../../interfaces';

// Test command for demonstrating modal component functionality
const command: Command = {
	parent: 'test',
	data: new SlashCommandSubcommandBuilder().setName('modals').setDescription('Test modals'),
	async execute(interaction, _client) {
		// Validate guild context
		if (!interaction.guild) {
			return interaction.reply({
				content: 'This command can only be used in a server.',
				ephemeral: true,
			});
		}

		// Build and show test modal
		const modal = await modals.TestModal.build(_client);
		return await interaction.showModal(modal);
	},
};

module.exports = command;
