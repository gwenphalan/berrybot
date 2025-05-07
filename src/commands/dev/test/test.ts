import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '@/core/interfaces/Command';
import { LocalizedSlashCommandBuilder } from '@/core/utils/Locale';

// Base test command with developer-only access
const command: Command = {
	data: new LocalizedSlashCommandBuilder()
		.setName('test')
		.setDescription('Test command')
		.setDefaultMemberPermissions(0), // No permissions required
	developer: true, // Only accessible to developers
	async execute(interaction: ChatInputCommandInteraction, _client) {
		// Send test confirmation
		await interaction.reply('Test command executed!');
	},
};

export default command;
