import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '@/core/interfaces';
import { LocalizedSlashCommandBuilder } from '@/core/utils/Locale';

// Simple example command that 	responds with 'Pong!'
const command: Command = {
	data: new LocalizedSlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
	async execute(interaction: ChatInputCommandInteraction, _client) {
		// Send simple response
		await interaction.reply({
			content: 'Pong!',
		});
	},
};

module.exports = command;
