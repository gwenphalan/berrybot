import dotenv from 'dotenv';
import { logger } from '../util';

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
}

/**
 * Validate required environment variables
 * Throws errors if critical configuration is missing
 */
if (!process.env.DISCORD_TOKEN) {
	throw new Error('No Discord bot token provided.');
}

/**
 * Bot configuration object
 * Combines environment variables into a structured configuration
 */
export const config: Config = {
	token: process.env.DISCORD_TOKEN,
	developer: process.env.DEVELOPER_ID,
};
