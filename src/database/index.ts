import mongoose from 'mongoose';
import { config } from '../config';
import { GuildSettings } from './schemas/GuildSettings';
import { logger } from '../util';

/**
 * Database connection and model management
 * Handles MongoDB connection and provides access to database models
 */

// Connect to MongoDB with configuration
logger.debug('Connecting to MongoDB...');
mongoose.connect(config.mongo_string, {
	dbName: config.database_name,
});
logger.debug(`Using database: ${config.database_name}`);

// Get database connection instance
const db = mongoose.connection;

// Handle connection errors
db.on('error', (err) => {
	logger.error({ error: err }, 'MongoDB connection error');
});

// Handle successful connection
db.once('open', () => {
	logger.info(`Connected to MongoDB Atlas at ${db.name}`);
});

/**
 * Guild Settings management
 * Provides methods to get and update guild-specific settings
 */
export const guildSettings = {
	/**
	 * Get guild settings, creating default settings if none exist
	 * @param guildId - The ID of the guild to get settings for
	 * @returns Promise resolving to the guild settings
	 */
	get: async (guildId: string) => {
		logger.debug(`Fetching settings for guild: ${guildId}`);
		const settings = await GuildSettings.findOne({ guild: guildId });

		if (settings) {
			logger.debug(`Found existing settings for guild: ${guildId}`);
			return settings;
		}

		logger.debug(`Creating default settings for guild: ${guildId}`);
		return await GuildSettings.create({
			guild: guildId,
			selfRoles: {
				categories: [],
			},
		});
	},

	/**
	 * Update guild settings
	 * @param guildId - The ID of the guild to update settings for
	 * @param settings - The new settings to apply
	 */
	async update(guildId: string, settings: GuildSettings) {
		logger.debug(`Updating settings for guild: ${guildId}`);
		await GuildSettings.updateOne({ guild: guildId }, settings);
		logger.debug(`Settings updated for guild: ${guildId}`);
	},

	/** Mongoose model for guild settings */
	model: GuildSettings,
};

// Add new models here

/**
 * Database interface
 * Exports all database models and their management functions
 */
export const database = {
	guildSettings,
	// Add new models here
};
