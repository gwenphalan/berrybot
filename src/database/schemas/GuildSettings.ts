import mongoose from 'mongoose';

export interface GuildSettings extends mongoose.Document {
    guild: string;
}

const GuildSettingsSchema = new mongoose.Schema({
    guild: String
});

export const GuildSettings = mongoose.model<GuildSettings>('GuildSettings', GuildSettingsSchema);
