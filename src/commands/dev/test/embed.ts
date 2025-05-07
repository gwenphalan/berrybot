import { Command } from '@/core/interfaces/Command';
import { LocalizedSlashCommandSubcommandBuilder } from '@/core/utils/Locale';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
// Test command for demonstrating embed message functionality
const command: Command = {
	parent: 'test',
	data: new LocalizedSlashCommandSubcommandBuilder()
		.setName('embed')
		.setDescription('Test embed'),
	async execute(interaction: ChatInputCommandInteraction, _client) {
		// Create and configure example embed
		const embed = new EmbedBuilder()
			.setTitle('Example')
			.setDescription('This is an example message.');

		// Send ephemeral message with embed
		await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
};

export default command;
