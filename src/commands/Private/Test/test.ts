import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../../interfaces';

// Base test command with developer-only access
const command: Command = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('Test command')
		.setDefaultMemberPermissions(0), // No permissions required
	developer: true, // Only accessible to developers
	async execute(interaction: ChatInputCommandInteraction) {
		// Send test confirmation
		return await interaction.reply('Test command executed!');
	},
};

module.exports = command;
