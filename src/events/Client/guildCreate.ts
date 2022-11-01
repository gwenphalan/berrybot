import { Event } from '../../interfaces/event';
import { Events, Guild } from 'discord.js';
import { Client } from '../../interfaces/Client';

export const event: Event = {
    name: Events.GuildCreate,
    async execute(guild: Guild, c: Client) {
        const databaseEntry = await c.database.guildSettings.get(guild.id);

        console.log(`Added guild ${guild.name} [${guild.id}] to the database! (Entry ID: ${databaseEntry._id})`);
    }
};
