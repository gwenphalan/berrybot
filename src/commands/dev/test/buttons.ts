import {
	ActionRowBuilder,
	ButtonBuilder,
	ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from 'discord.js';
import { Test_Button } from '@/components';
import { Command } from '@/core/interfaces/Command';

// Test command for demonstrating button component functionality
const command: Command = {
	parent: 'test',
	data: new SlashCommandSubcommandBuilder().setName('button').setDescription('Test button'),
	async execute(interaction: ChatInputCommandInteraction, client) {
		// Validate guild context
		if (!interaction.guild) {
			return await interaction.reply({
				content: 'This command can only be used in a server.',
				ephemeral: true,
			});
		}

		// Create action row with test button component
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			await new Test_Button().build(client)
		);

		// Send message with button
		return await interaction.reply({ content: 'Test Button', components: [row] });
	},
};

export default command;
