import { Role } from 'discord.js';
import mongoose from 'mongoose';

/**
 * Interface for guild settings document
 * Extends mongoose.Document to include MongoDB document properties
 */
export interface GuildSettings extends mongoose.Document {
	/** The Discord guild (server) ID */
	guild: string;
}

/**
 * Mongoose schema for guild settings
 * Defines the structure and validation for guild settings documents
 */
const GuildSettingsSchema = new mongoose.Schema({
	/** The Discord guild (server) ID */
	guild: String,
});

/**
 * Mongoose model for guild settings
 * Provides methods for interacting with guild settings in the database
 */
export const GuildSettings = mongoose.model<GuildSettings>('GuildSettings', GuildSettingsSchema);
