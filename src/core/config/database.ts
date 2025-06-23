import mongoose from 'mongoose';
import { config } from '@/core/config/config';
import { GuildSettings } from '@/database/GuildSettings';
import { Flows } from '@/database/Flows';
import { UserSettings } from '@/database/UserSettings';
import { logger } from '@/core/logging/Logger';
import { ErrorLog } from '@/database/ErrorLog';

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
	get: async (guildId: string): Promise<GuildSettings> => {
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

/**
 * Flows management
 * Provides methods to manage persistent flows
 */
export const flows = {
	/**
	 * Get a flow by message ID
	 * @param messageId - The ID of the message associated with the flow
	 * @returns Promise resolving to the flow or null if not found
	 */
	getByMessage: async (messageId: string): Promise<Flows | null> => {
		logger.debug(`Fetching flow for message: ${messageId}`);
		return await Flows.findOne({ messageId });
	},

	/**
	 * Get flows by guild and type
	 * @param guildId - The ID of the guild
	 * @param flowType - The type of flow
	 * @param userId - Optional user ID for user-specific flows
	 * @returns Promise resolving to array of matching flows
	 */
	getByGuild: async (guildId: string, flowType: string, userId?: string): Promise<Flows[]> => {
		logger.debug(
			`Fetching flows for guild: ${guildId}, type: ${flowType}${userId ? `, user: ${userId}` : ''}`
		);
		const query = userId ? { guildId, flowType, userId } : { guildId, flowType };
		return await Flows.find(query);
	},

	/**
	 * Create a new flow
	 * @param flowData - The flow data to create
	 * @returns Promise resolving to the created flow
	 */
	create: async (flowData: Partial<Flows>): Promise<Flows> => {
		logger.debug(`Creating new flow: ${flowData.flowType}`);
		return await Flows.create(flowData);
	},

	/**
	 * Update an existing flow
	 * @param messageId - The message ID of the flow to update
	 * @param flowData - The new flow data
	 * @returns Promise resolving to the updated flow
	 */
	update: async (messageId: string, flowData: Partial<Flows>): Promise<Flows | null> => {
		logger.debug(`Updating flow for message: ${messageId}`);
		return await Flows.findOneAndUpdate({ messageId }, flowData, { new: true });
	},

	/**
	 * Delete a flow
	 * @param messageId - The message ID of the flow to delete
	 */
	delete: async (messageId: string): Promise<void> => {
		logger.debug(`Deleting flow for message: ${messageId}`);
		await Flows.findOneAndDelete({ messageId });
	},

	/**
	 * Clean up expired flows
	 * @returns Promise resolving to the number of deleted flows
	 */
	cleanupExpired: async (): Promise<number> => {
		logger.debug('Cleaning up expired flows');
		const result = await Flows.deleteMany({
			expiresAt: { $lt: new Date() },
		});
		return result.deletedCount || 0;
	},

	/** Mongoose model for flows */
	model: Flows,
};

/**
 * User Settings management
 * Provides methods to get and update user-specific settings (locale)
 */
export const userSettings = {
	/**
	 * Get user settings, creating default if none exist
	 * @param userId - The ID of the user to get settings for
	 * @returns Promise resolving to the user settings
	 */
	get: async (userId: string): Promise<UserSettings> => {
		logger.debug(`[userSettings.get] Fetching settings for user: ${userId}`);
		try {
			logger.debug(`[userSettings.get] Calling UserSettings.findOne for user: ${userId}`);
			const settings = await UserSettings.findOne({ userId });
			logger.debug(
				`[userSettings.get] UserSettings.findOne result for user: ${userId}: ${settings ? 'found' : 'not found'}`
			);
			if (settings) {
				logger.debug(`[userSettings.get] Found existing settings for user: ${userId}`);
				return settings;
			}
			logger.debug(`[userSettings.get] Creating default settings for user: ${userId}`);
			return await UserSettings.create({ userId, locale: 'en-US' });
		} catch (err) {
			logger.error(`[userSettings.get] Error fetching settings for user: ${userId}`, err);
			throw err;
		}
	},

	/**
	 * Update user settings
	 * @param userId - The ID of the user to update settings for
	 * @param locale - The new locale to set
	 */
	async setLocale(userId: string, locale: string) {
		logger.debug(`Updating locale for user: ${userId} to ${locale}`);
		await UserSettings.updateOne({ userId }, { locale }, { upsert: true });
		logger.debug(`Locale updated for user: ${userId}`);
	},

	/** Mongoose model for user settings */
	model: UserSettings,
};

/**
 * Error Logs management
 * Provides methods to log command errors
 */
export const errorLogs = {
	/**
	 * Log a new error
	 * @param errorData - The error log data to create
	 * @returns Promise resolving to the created error log
	 */
	create: async (errorData: Partial<ErrorLog>): Promise<ErrorLog> => {
		logger.debug(`[database.errorLogs.create] Logging error: ${errorData.errorId}`);
		return await ErrorLog.create(errorData);
	},

	/** Mongoose model for error logs */
	model: ErrorLog,
};

/**
 * Database interface
 * Exports all database models and their management functions
 */
export const database = {
	guildSettings,
	flows,
	userSettings,
	errorLogs,
};
