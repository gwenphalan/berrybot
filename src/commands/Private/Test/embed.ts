import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandSubcommandBuilder,
} from 'discord.js';
import { Command } from '../../../interfaces';

// Test command for demonstrating embed message functionality
const command: Command = {
	parent: 'test',
	data: new SlashCommandSubcommandBuilder().setName('embed').setDescription('Test embed'),
	async execute(interaction: ChatInputCommandInteraction, _client) {
		// Create and configure example embed
		const embed = new EmbedBuilder()
			.setTitle('Example')
			.setDescription('This is an example message.');

		// Send ephemeral message with embed
		return await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
};

module.exports = command;
