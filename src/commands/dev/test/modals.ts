import { Test_Modal } from '@/components';
import { Command } from '@/core/interfaces/Command';
import { LocalizedSlashCommandSubcommandBuilder } from '@/core/utils/Locale';
// Test command for demonstrating modal component functionality
const command: Command = {
	parent: 'test',
	data: new LocalizedSlashCommandSubcommandBuilder()
		.setName('modals')
		.setDescription('Test modals'),
	async execute(interaction, _client) {
		// Validate guild context
		if (!interaction.guild) {
			await interaction.reply({
				content: 'This command can only be used in a server.',
				ephemeral: true,
			});
			return;
		}

		// Build and show test modal
		const modal = await new Test_Modal().build(_client, { data: {} });
		await interaction.showModal(modal);
	},
};

export default command;
