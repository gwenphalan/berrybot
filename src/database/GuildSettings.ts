import { Role } from 'discord.js';
import mongoose from 'mongoose';

/**
 * Interface for guild settings document
 * Extends mongoose.Document to include MongoDB document properties
 */
export interface GuildSettings extends mongoose.Document {
	/** The Discord guild (server) ID */
	guild: string;
	/** Self-assignable roles configuration */
	selfRoles: {
		/** Optional message ID for the self-roles message */
		message?: string;
		/** Categories of self-assignable roles */
		categories: SelfRoleCategory[];
		/** Optional channel ID where self-roles are managed */
		channel?: string;
	};
}

/**
 * Interface for a category of self-assignable roles
 * Represents a group of roles that can be self-assigned by users
 */
export interface SelfRoleCategory {
	/** Display name for the category */
	name: string;
	/** Array of role IDs that belong to this category */
	roles: Role['id'][];
	/** Optional emoji to display with the category */
	emoji: string;
}

/**
 * Mongoose schema for guild settings
 * Defines the structure and validation for guild settings documents
 */
const GuildSettingsSchema = new mongoose.Schema({
	/** The Discord guild (server) ID */
	guild: String,
	/** Self-assignable roles configuration */
	selfRoles: {
		/** Categories of self-assignable roles */
		categories: Array<{
			/** Display name for the category */
			name: string;
			/** Array of role IDs that belong to this category */
			roles: Array<string>;
			/** Optional emoji to display with the category */
			emoji: string;
		}>,
		/** Optional message ID for the self-roles message */
		message: String,
		/** Optional channel ID where self-roles are managed */
		channel: String,
	},
});

/**
 * Mongoose model for guild settings
 * Provides methods for interacting with guild settings in the database
 */
export const GuildSettings = mongoose.model<GuildSettings>('GuildSettings', GuildSettingsSchema);
