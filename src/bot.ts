// Import the register-aliases.ts file first
import './register-aliases';

import { GatewayIntentBits, Partials } from 'discord.js';
import { Client } from './interfaces';
import { logger } from './util';
export * as util from './util';
export * as handlers from './handlers';
export * as interfaces from './interfaces';
export * as messages from './messages';

// Track the current shard ID for multi-shard deployments
let shardId: number | null = null;

// Handle IPC messages from the sharding manager
process.on('message', (message: { type: string; data?: { shardId: number } }) => {
	if (!message.type) {
		logger.warn('Received message without type');
		return false;
	}

	// Store shard ID when received from sharding manager
	if (message.type === 'shardId') {
		shardId = message.data?.shardId ?? null;
		logger.debug(`Received shard ID: ${shardId}`);
		return true;
	}

	logger.warn({ messageType: message.type }, 'Received unknown message type');
	return false;
});

// Define required Discord gateway intents
const { Guilds, GuildMembers, GuildMessages, GuildMessageReactions } = GatewayIntentBits;
// Define required partial structures for handling cached data
const { User, Message, GuildMember, ThreadMember, Reaction } = Partials;

// Initialize Discord client with required intents and partials
const client = new Client({
	intents: [Guilds, GuildMembers, GuildMessages, GuildMessageReactions],
	partials: [User, Message, GuildMember, ThreadMember, Reaction],
});

// Log initialization and start the bot
logger.info(`Initializing bot${shardId !== null ? ` with shard ID: ${shardId}` : ''}`);
client.init().catch((error) => {
	logger.error({ error, shardId }, 'Failed to initialize bot');
	process.exit(1);
});
