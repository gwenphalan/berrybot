import { ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Test_Button } from '@/components';
import { Command } from '@/core/interfaces/Command';
import { LocalizedSlashCommandSubcommandBuilder } from '@/core/utils/Locale';
// Test command for demonstrating button component functionality
const command: Command = {
	parent: 'test',
	data: new LocalizedSlashCommandSubcommandBuilder()
		.setName('button')
		.setDescription('Test button'),
	async execute(interaction: ChatInputCommandInteraction, client) {
		// Validate guild context
		if (!interaction.guild) {
			await interaction.reply({
				content: 'This command can only be used in a server.',
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
