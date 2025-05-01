import { Event } from '../../interfaces';
import { Events } from 'discord.js';
import { loadCommands } from '../../handlers';
import { Client } from '../../interfaces';
import { logger } from '../../util';
export const event: Event = {
    name: Events.ClientReady,
    once: true,
    execute(c: Client) {
        logger.info(`Logged in as ${c.user?.tag}!`);

        loadCommands(c);
    }
};
