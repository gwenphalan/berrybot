import { Event } from '../../interfaces';
import { Events } from 'discord.js';
import { loadCommands } from '../../handlers';
import { Client } from '../../interfaces';

export const event: Event = {
    name: Events.ClientReady,
    once: true,
    execute(c: Client) {
        console.log(`Logged in as ${c.user?.tag}!`);

        loadCommands(c);
    }
};
