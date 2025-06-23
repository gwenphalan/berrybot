import { ActionRowBuilder, ChatInputCommandInteraction, StringSelectMenuBuilder } from 'discord.js';
import { Test_Select, Test_MultiSelect } from '@/components';
import { SubCommand } from '@/core/interfaces/Command';
import { LocalizedSlashCommandSubcommandBuilder } from '@/core/utils/Locale';
// Test command for demonstrating select menu component functionality
const command: SubCommand = {
	parent: 'test',
	data: new LocalizedSlashCommandSubcommandBuilder()
		.setName('select-menu')
		.setDescription('Test select menu')
		.setLocalizedName('commands.test.select_menu.name')
		.setLocalizedDescription('commands.test.select_menu.description')
		.addStringOption((option) =>
			option
				.setName('type')
				.setDescription('commands.test.select_menu.option.type.description')
				.setRequired(true)
				.addChoices(
					{ name: 'commands.test.select_menu.option.type.single', value: 'single' },
					{ name: 'commands.test.select_menu.option.type.multi', value: 'multi' }
				)
		),
	async execute(interaction: ChatInputCommandInteraction, _client) {
		// Validate guild context
		if (!interaction.guild) {
			await interaction.reply({
				content: 'This command can only be used in a server.',
				ephemeral: true,
			});
			return;
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
				row.addComponents(await new Test_Select().build(_client, { data: {} }));
				break;
			case 'multi':
				row.addComponents(await new Test_MultiSelect().build(_client, { data: {} }));
				break;
		}

		// Infer locale from interaction or default
		const locale = interaction.locale || 'en-US';

		// Send message with select menu
		await interaction.reply({
			content:
				_client.getTranslation('commands.test.select_menu.reply', locale) ||
				'Test Select Menu',
			components: [row],
		});
	},
};

export default command;
