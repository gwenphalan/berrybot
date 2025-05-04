import { Event } from '../../interfaces';
import { Events } from 'discord.js';
import { loadCommands } from '../../handlers';
import { Client } from '../../interfaces';
import { logger } from '../../util';
import { database } from '../../database';

/**
 * Register active flows with the FlowManager
 */
async function registerFlows(client: Client) {
	try {
		logger.info('Registering active flows...');
		const flows = await database.flows.model.find({
			expiresAt: { $gt: new Date() },
		});

		for (const flow of flows) {
			try {
				// Create a new handler instance based on flow type
				let handler;
				switch (flow.flowType) {
					case 'ROLE_SELECT':
						// Add handler initialization for ROLE_SELECT
						logger.info(`ROLE_SELECT flow found, but handler not implemented yet.`);
						continue;
					default:
						logger.warn(`Unknown flow type: ${flow.flowType}`);
						continue;
				}

				// Set the state from the database
				handler.setState(flow.currentState);

				// Register the handler with the message ID
				client.flowManager.registerHandler(flow.messageId, handler);
				logger.info(`Registered flow: ${flow.flowType} (${flow.messageId})`);
			} catch (error) {
				logger.error(
					{ error },
					`Failed to register flow: ${flow.flowType} (${flow.messageId})`
				);
			}
		}

		logger.info(`Registered ${flows.length} active flows`);
	} catch (error) {
		logger.error({ error }, 'Failed to register flows');
	}
}

export const event: Event = {
	name: Events.ClientReady,
	once: true,
	async execute(c: Client) {
		logger.info(`Logged in as ${c.user?.tag}!`);

		// Load commands and register flows
		await Promise.all([loadCommands(c), registerFlows(c)]);
	},
};
