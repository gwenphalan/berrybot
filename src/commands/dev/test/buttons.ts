import { ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Test_Button } from '@/components';
import { Command } from '@/core/interfaces/Command';
import { LocalizedSlashCommandSubcommandBuilder } from '@/core/utils/Locale';
// Test command for demonstrating button component functionality
const command: Command = {
	parent: 'test',
	data: new LocalizedSlashCommandSubcommandBuilder()
		.setName('button')
		.setDescription('Test button')
		.setLocalizedName('commands.test.button.name')
		.setLocalizedDescription('commands.test.button.description'),
	async execute(interaction: ChatInputCommandInteraction, client) {
		const locale = interaction.locale || 'en-US';
		// Validate guild context
		if (!interaction.guild) {
			await interaction.reply({
				content: client.getTranslation('commands.test.button.guild_only', locale),
				ephemeral: true,
			});
			return;
		}

		// Create action row with test button component
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			await new Test_Button().build(client)
		);

		// Send message with button
		await interaction.reply({ content: 'Test Button', components: [row] });
	},
};

export default command;
