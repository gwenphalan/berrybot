import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	StringSelectMenuBuilder,
} from 'discord.js';
import { Test_Select, Test_MultiSelect } from '@/components';
import { Command } from '@/core/interfaces/Command';

// Test command for demonstrating select menu component functionality
const command: Command = {
	parent: 'test',
	data: new SlashCommandSubcommandBuilder()
		.setName('select-menu')
		.setDescription('Test select menu')
		.addStringOption((option) =>
			option
				.setName('type')
				.setDescription('Type of select menu')
				.setRequired(true)
				.addChoices({ name: 'Single', value: 'single' }, { name: 'Multi', value: 'multi' })
		),
	async execute(interaction: ChatInputCommandInteraction, _client) {
		// Validate guild context
		if (!interaction.guild) {
			return interaction.reply({
				content: 'This command can only be used in a server.',
				ephemeral: true,
			});
		}

		// Get selected menu type from options
		const type: 'single' | 'multi' = interaction.options.getString('type', true) as
			| 'single'
			| 'multi';

		// Create action row for select menu
		const row = new ActionRowBuilder<StringSelectMenuBuilder>();

		// Add appropriate select menu based on type
		switch (type) {
			case 'single':
				row.addComponents(await Test_Select.build(_client));
				break;
			case 'multi':
				row.addComponents(await Test_MultiSelect.build(_client));
				break;
		}

		// Send message with select menu
		return await interaction.reply({ content: 'Test Select Menu', components: [row] });
	},
};

export default command;
