import { Event } from '../../interfaces/event';
import { Events } from 'discord.js';
import { loadCommands } from '../../handlers/CommandHandler';
import { Client } from '../../interfaces/Client';

export const event: Event = {
    name: Events.ClientReady,
    once: true,
    execute(c: Client) {
        console.log(`Logged in as ${c.user?.tag}!`);

        loadCommands(c);
    }
};
