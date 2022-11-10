import mongoose from 'mongoose';
import { config } from '../config';
import { GuildSettings } from './schemas/GuildSettings';

mongoose.connect(config.mongo_string, {
    dbName: config.database_name
});

const db = mongoose.connection;

db.on('error', err => console.log(err));

db.once('open', () => console.log(`Connected to MongoDB Atlas at ${db.name}`));

export const guildSettings = {
    get: async (guildId: string) =>
        (await GuildSettings.findOne({ guild: guildId })) ||
        (await GuildSettings.create({
            guild: guildId,
            selfRoles: {
                categories: []
            }
        })),
    async update(guildId: string, settings: GuildSettings) {
        await GuildSettings.updateOne({ guild: guildId }, settings);
    },
    model: GuildSettings
};

export const database = {
    guildSettings
};
