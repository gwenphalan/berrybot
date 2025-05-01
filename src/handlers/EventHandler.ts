import type { Client } from '../interfaces';
import { Files, logger } from '../util';

export const loadEvents = async (client: Client) => {
	const ascii = require('ascii-table');
	const table = new ascii().setHeading('Events', 'Status');

	await client.events.clear();

	const files = await Files.load('events');

	logger.info('Loading events...');

	files.forEach((file: string) => {
		try {
			const { event } = require(file);

			const execute = (...args: any[]) => {
				event.execute(...args, client);
			};

			client.events.set(event.name, execute);

			if (event.rest) {
				if (event.once) {
					client.rest.on(event.name, execute);
				} else {
					client.rest.on(event.name, execute);
				}
			} else if (event.once) {
				client.once(event.name, execute);
			} else {
				client.on(event.name, execute);
			}

			table.addRow(event.name, '🟩');
		} catch (error) {
			const eventName = file.split('/')[file.split('/').length - 1].split('.')[0];
			logger.error(error);
			table.addRow(eventName, '🟥');
		}
	});

	logger.info('\n' + table.toString());

	logger.info('Events Loaded.');
};
