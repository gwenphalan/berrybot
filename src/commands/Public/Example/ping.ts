import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../../interfaces';

// Simple example command that responds with 'Pong!'
const command: Command = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
	async execute(interaction: ChatInputCommandInteraction) {
		// Send simple response
		await interaction.reply({
			content: 'Pong!',
		});
	},
};

module.exports = command;
