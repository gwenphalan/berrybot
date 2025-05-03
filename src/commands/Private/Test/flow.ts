import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Command } from '../../../interfaces';
import { ExampleFlow } from '../../../flows/ExampleFlow';
import { logger } from '../../../util/Logger';

// Description of what this subcommand does
const command: Command = {
	parent: 'test',
	data: new SlashCommandSubcommandBuilder().setName('flow').setDescription('Flow test'),

	async execute(interaction, client) {
		logger.debug('Initializing flow test command');
		// Validate guild context
		if (!interaction.guild) {
			logger.debug('Command used outside of guild context');
			return interaction.reply({
				content: 'This command can only be used in a server.',
				ephemeral: true,
			});
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

			return interaction.reply({
				content: 'An error occurred while initializing the flow.',
				ephemeral: true,
			});
		}
	},
};

module.exports = command;
