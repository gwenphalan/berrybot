import type { Client } from '../interfaces';
import { Files } from '../util';

export const loadEvents = async (client: Client) => {
    const ascii = require('ascii-table');
    const table = new ascii().setHeading('Events', 'Status');

    await client.events.clear();

    const files = await Files.load('events');

    console.log('Loading events...');

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
            console.log(`${eventName}: ${error}`);
            console.error(error);
            table.addRow(eventName, '🟥');
        }
    });

    console.log('\n' + table.toString());

    console.log('Events Loaded.');
};
