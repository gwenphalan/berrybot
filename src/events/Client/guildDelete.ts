import { Event } from '../../interfaces/event';
import { Events, Guild } from 'discord.js';
import { Client } from '../../interfaces/Client';

export const event: Event = {
    name: Events.GuildDelete,
    async execute(guild: Guild, c: Client) {
        const databaseEntry = await c.database.guildSettings.get(guild.id);

        return databaseEntry.delete().then(() => console.log(`Deleted guild ${guild.name} [${guild.id}] from the database! (Entry ID: ${databaseEntry._id})`));
    }
};
