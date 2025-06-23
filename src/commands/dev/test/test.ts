import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '@/core/interfaces/Command';
import { LocalizedSlashCommandBuilder } from '@/core/utils/Locale';

// Base test command with developer-only access
const command: Command = {
	data: new LocalizedSlashCommandBuilder()
		.setName('test')
		.setDescription('Test command')
		.setLocalizedName('commands.test.name')
		.setLocalizedDescription('commands.test.description')
		.setDefaultMemberPermissions(0), // No permissions required
	developer: true, // Only accessible to developers
	async execute(interaction: ChatInputCommandInteraction, _client) {
		const locale = interaction.locale || 'en-US';
		// Send test confirmation
		await interaction.reply(
			_client.getTranslation('commands.test.reply', locale) || 'Test command executed!'
		);
	},
};

export default command;
