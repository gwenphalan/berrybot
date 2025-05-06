import { Event } from '@/core/interfaces';
import { Events } from 'discord.js';
import { loadCommands } from '@/core/managers';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import { database } from '@/core/config/database';

/**
 * Register active flows with the FlowManager
 */
async function registerFlows(_client: Client) {
	try {
		logger.info('Registering active flows...');

		// Check if there are any flows that need to be registered
		const flows = await database.flows.model.find({
			expiresAt: { $gt: new Date() },
		});

		if (flows.length === 0) {
			logger.info('No active flows found to register');
			return;
		}

		// Log the number of flows found but don't attempt to register them yet
		logger.info(
			`Found ${flows.length} active flows, but flow registration is not fully implemented yet`
		);

		// Uncomment and implement this code when persistent flows are needed
		/*
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

				// Only proceed if we have a valid handler
				if (!handler) {
					logger.warn(`No handler initialized for flow: ${flow.flowType}`);
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
		*/
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
