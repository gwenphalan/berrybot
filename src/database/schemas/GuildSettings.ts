import { Role } from 'discord.js';
import mongoose from 'mongoose';

export interface GuildSettings extends mongoose.Document {
    guild: string;
    selfRoles: {
        message?: string;
        categories: SelfRoleCategory[];
        channel?: string;
    };
}

export interface SelfRoleCategory {
    name: string;
    roles: Role['id'][];
    emoji: string;
}

const GuildSettingsSchema = new mongoose.Schema({
    guild: String,
    selfRoles: {
        categories: Array<{
            name: String;
            roles: Array<String>;
            emoji?: String;
        }>,
        message: String,
        channel: String
    }
});

export const GuildSettings = mongoose.model<GuildSettings>('GuildSettings', GuildSettingsSchema);
