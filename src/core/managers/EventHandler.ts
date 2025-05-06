import type { Client } from '@/core/client/BerryClient';
import { Files, logger } from '@/core/utils';
import AsciiTable from 'ascii-table';

// Main function to load and register all event handlers with Discord
export const loadEvents = async (client: Client) => {
	const table = new AsciiTable().setHeading('Events', 'Status');

	// Track event types for final summary
	let restEventCount = 0;
	let regularEventCount = 0;

	// Clear existing events before loading new ones in case of event reload
	logger.debug('Clearing existing events...');
	await client.events.clear();
	logger.debug(`Cleared ${client.events.size} existing events`);

	// Load all event files from the events directory
	logger.debug('Scanning events directory...');
	const files = await Files.load('events');
	logger.debug(`Found ${files.length} event files to load`);

	logger.info('Loading events...');

	// Process each event file
	for (const file of files) {
		const eventName = file.split('/')[file.split('/').length - 1].split('.')[0];
		logger.debug(`Processing event: ${eventName}`);
		try {
			const { event } = await import(file);
			logger.debug(`Loaded event: ${event.name}`);

			// Create event handler that includes client instance
			const execute = (...args: any[]) => {
				event.execute(...args, client);
			};

			// Store event handler in client's event map
			client.events.set(event.name, execute);
			logger.debug(`Registered event handler: ${event.name}`);

			// Register event with Discord client or REST API based on event type
			if (event.rest) {
				logger.debug(`Registering REST event: ${event.name}`);
				if (event.once) {
					client.rest.on(event.name, execute);
					logger.debug(`Registered as REST once event: ${event.name}`);
				} else {
					client.rest.on(event.name, execute);
					logger.debug(`Registered as REST event: ${event.name}`);
				}
				restEventCount++;
			} else if (event.once) {
				logger.debug(`Registering once event: ${event.name}`);
				client.once(event.name, execute);
				regularEventCount++;
			} else {
				logger.debug(`Registering regular event: ${event.name}`);
				client.on(event.name, execute);
				regularEventCount++;
			}

			table.addRow(event.name, '🟩');
		} catch (error) {
			logger.error(`Error loading event ${eventName}: ${error}`);
			logger.debug(`Failed to load event ${eventName} from path: ${file}`);
			table.addRow(eventName, '🟥');
		}
	}

	// Display event loading results
	logger.info('\n' + table.toString());
	logger.info(`Events Loaded - Total: ${client.events.size}`);
	logger.debug(`Event breakdown: REST: ${restEventCount}, Regular: ${regularEventCount}`);
};
