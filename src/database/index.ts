import mongoose from 'mongoose';
import { config } from '../../config';
import { GuildSettings } from './schemas/GuildSettings';

// Connect to MongoDB Database
mongoose.connect(config.mongo_string, {
    dbName: config.database
});
const db = mongoose.connection;

// Log Database Errors
db.on('error', err => {
    console.error(err);
});

// Log a message once the Database connection is made
db.once('open', () => {
    console.log(`Connected to MongoDB Atlas at ${db.name}!`);
});

export const guildSettings = {
    get: async (guildId: string) =>
        (await GuildSettings.findOne({ guild: guildId })) ||
        (await GuildSettings.create({
            guild: guildId
        })),
    async update(guildId: string, settings: GuildSettings) {
        await GuildSettings.updateOne({ guild: guildId }, settings);
    },
    model: GuildSettings
};

export const database = {
    guildSettings: guildSettings
};
