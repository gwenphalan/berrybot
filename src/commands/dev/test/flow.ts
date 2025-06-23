import { Command } from '@/core/interfaces/Command';
import { ExampleFlow } from '@/flows/ExampleFlow';
import { logger } from '@/core/logging/Logger';
import { LocalizedSlashCommandSubcommandBuilder } from '@/core/utils/Locale';
// Description of what this subcommand does
const command: Command = {
	parent: 'test',
	data: new LocalizedSlashCommandSubcommandBuilder()
		.setName('flow')
		.setDescription('Test flow')
		.setLocalizedName('commands.test.flow.name')
		.setLocalizedDescription('commands.test.flow.description'),

	async execute(interaction, client) {
		const locale = interaction.locale || 'en-US';
		logger.debug('Initializing flow test command');
		// Validate guild context
		if (!interaction.guild) {
			logger.debug('Command used outside of guild context');
			await interaction.reply({
				content: client.getTranslation('commands.test.flow.guild_only', locale),
				ephemeral: true,
			});
			return;
		}

		try {
			// Start the flow with initial state
			await client.flowManager.startFlow(interaction, new ExampleFlow(client), {
				id: 'example-flow',
				data: {
					count: 0,
					lastUpdated: new Date().toISOString(),
				},
			});

			logger.debug(
				{
					flowId: 'example-flow',
				},
				'Flow initialized successfully'
			);
		} catch (error) {
			logger.error(
				{
					error: error instanceof Error ? error.message : 'Unknown error',
					stack: error instanceof Error ? error.stack : undefined,
				},
				'Error initializing flow'
			);

			await interaction.reply({
				content: client.getTranslation('commands.test.flow.error', locale),
				ephemeral: true,
			});
			return;
		}
	},
};

export default command;
