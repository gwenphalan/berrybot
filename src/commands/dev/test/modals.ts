import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Test_Modal } from '@/components';
import { Command } from '@/core/interfaces/Command';

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
		const modal = await Test_Modal.build(_client);
		return await interaction.showModal(modal);
	},
};

export default command;
