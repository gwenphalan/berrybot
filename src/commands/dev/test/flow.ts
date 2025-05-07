import { Command } from '@/core/interfaces/Command';
import { ExampleFlow } from '@/flows/ExampleFlow';
import { logger } from '@/core/logging/Logger';
import { LocalizedSlashCommandSubcommandBuilder } from '@/core/utils/Locale';
// Description of what this subcommand does
const command: Command = {
	parent: 'test',
	data: new LocalizedSlashCommandSubcommandBuilder().setName('flow').setDescription('Flow test'),

	async execute(interaction, client) {
		logger.debug('Initializing flow test command');
		// Validate guild context
		if (!interaction.guild) {
			logger.debug('Command used outside of guild context');
			await interaction.reply({
				content: 'This command can only be used in a server.',
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
				content: 'An error occurred while initializing the flow.',
				ephemeral: true,
			});
			return;
		}
	},
};

export default command;
