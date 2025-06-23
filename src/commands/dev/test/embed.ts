import { Command } from '@/core/interfaces/Command';
import { LocalizedSlashCommandSubcommandBuilder } from '@/core/utils/Locale';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
// Test command for demonstrating embed message functionality
const command: Command = {
	parent: 'test',
	data: new LocalizedSlashCommandSubcommandBuilder()
		.setName('embed')
		.setDescription('Test embed')
		.setLocalizedName('commands.test.embed.name')
		.setLocalizedDescription('commands.test.embed.description'),
	async execute(interaction: ChatInputCommandInteraction, _client) {
		const locale = interaction.locale || 'en-US';
		// Create and configure example embed
		const embed = new EmbedBuilder()
			.setTitle(
				_client.getTranslation('commands.test.embed.embed_title', locale) || 'Example'
			)
			.setDescription(
				_client.getTranslation('commands.test.embed.embed_description', locale) ||
					'This is an example message.'
			);

		// Send ephemeral message with embed
		await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
};

export default command;
