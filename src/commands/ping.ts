import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../interfaces/command';

const command: Command = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply('Pong!');
	},
};

module.exports = command;