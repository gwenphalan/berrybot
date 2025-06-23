import { Test_Modal } from '@/components';
import { Command } from '@/core/interfaces/Command';
import { LocalizedSlashCommandSubcommandBuilder } from '@/core/utils/Locale';
// Test command for demonstrating modal component functionality
const command: Command = {
	parent: 'test',
	data: new LocalizedSlashCommandSubcommandBuilder()
		.setName('modals')
		.setDescription('Test modals')
		.setLocalizedName('commands.test.modals.name')
		.setLocalizedDescription('commands.test.modals.description'),
	async execute(interaction, _client) {
		const locale = interaction.locale || 'en-US';
		// Validate guild context
		if (!interaction.guild) {
			await interaction.reply({
				content: _client.getTranslation('commands.test.modals.guild_only', locale),
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
