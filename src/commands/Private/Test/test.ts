import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../../interfaces';

const command: Command = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('Test command')
		.setDefaultMemberPermissions(0),
	developer: true,
	async execute(interaction: ChatInputCommandInteraction) {
		return await interaction.reply('Test command executed!');
	},
};

module.exports = command;
