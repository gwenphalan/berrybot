import dotenv from 'dotenv';
import { logger } from '@/core/logging/Logger';
// Import 'emojis.json' from the emojis folder
import emojis from '../../../emojis/emojis.json';

/**
 * Load environment variables from .env file
 * This must be called before accessing any environment variables
 */
dotenv.config();

/**
 * Configuration interface
 * Defines the structure of the bot's configuration
 */
export interface Config {
	/** Discord bot token used for authentication */
	token: string;
	/** Optional developer user ID for special permissions */
	developer?: string;
	/** Name of the MongoDB database to use */
	database_name: string;
	/** MongoDB connection string */
	mongo_string: string;
	/** Emojis registry */
	emojis: Emojis;
	/** Invite link to the support server */
	support_server: string;
	/** Channel ID for error logs */
	error_log_channel?: string;
	/** ID of the testing server */
	testing_server_id: string;
}

interface Emojis {
	activity: string;
	application_bot: string;
	automod: string;
	beta: string;
	booster: string;
	bot: string;
	card: string;
	developer: string;
	discord_stuff: string;
	discord_ticket: string;
	dislike: string;
	early_supporter: string;
	edit: string;
	event: string;
	file: string;
	global: string;
	guide: string;
	id: string;
	information: string;
	insights: string;
	join: string;
	leave: string;
	like: string;
	link: string;
	mail: string;
	member: string;
	members: string;
	moderator: string;
	moderator_orange: string;
	newbie: string;
	nitro: string;
	owner: string;
	partner: string;
	preview: string;
	privacy: string;
	private: string;
	public: string;
	raid_report: string;
	refresh: string;
	rules: string;
	search_threads: string;
	slash_command: string;
	ticket: string;
	verified: string;
	warning: string;
	website: string;
}

/**
 * Validate required environment variables
 * Throws errors if critical configuration is missing
 */
if (!process.env.DISCORD_TOKEN) {
	throw new Error('No Discord bot token provided.');
} else if (!process.env.MONGO_STRING) {
	throw new Error('No MongoDB connection string provided.');
} else if (!process.env.DATABASE_NAME) {
	logger.info('No database name provided. Defaulting to "development".');
}

/**
 * Bot configuration object
 * Combines environment variables into a structured configuration
 */
export const config: Config = {
	token: process.env.DISCORD_TOKEN,
	mongo_string: process.env.MONGO_STRING,
	developer: process.env.DEVELOPER_ID,
	database_name: process.env.NODE_ENV || 'development',
	emojis,
	support_server: `https://discord.gg/${process.env.SUPPORT_SERVER_ID}`,
	error_log_channel: process.env.ERROR_LOG_CHANNEL,
	testing_server_id: process.env.TESTING_SERVER_ID || '',
};
