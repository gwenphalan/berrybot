import { Event } from '../../interfaces';
import { Events, Guild } from 'discord.js';
import { Client } from '../../interfaces';

export const event: Event = {
    name: Events.GuildDelete,
    once: true,
    execute(c: Client, g: Guild) {
        c.database.guildSettings.get(g.id).then(settings => {
            settings.delete();
        });
    }
};
