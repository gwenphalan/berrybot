import mongoose from 'mongoose';
import { config } from '../../config';
import { GuildSettings } from './schemas/GuildSettings';

// Connect to MongoDB Database
mongoose.connect(config.mongo_string, {
});
const db = mongoose.connection;

// Log Database Errors
db.on('error', err => console.error(err));

// Log a message once the Database connection is made
db.once('open', () => console.log(`Connected to MongoDB Atlas at ${db.name}!`, 'DB'));

export const database = {
    guildSettings: GuildSettings
}

export const guildSettings = {
    get: async (guildId: string) => {
    return (
        (await GuildSettings.findOne({ guild: guildId })) ||
        (await GuildSettings.create({
            guild: guildId
        }))
    )},
    update: async (guildId: string, settings: GuildSettings) => {
        await GuildSettings.updateOne({ guild: guildId }, settings);
    },
};