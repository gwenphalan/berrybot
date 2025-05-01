import { GatewayIntentBits, Partials } from 'discord.js';
import { Client } from './interfaces';
import { logger } from './util';
export * as util from './util';
export * as handlers from './handlers';
export * as interfaces from './interfaces';
export * as messages from './messages';

let shardId: any;

process.on('message', (message: any) => {
	if (!message.type) return false;

	if (message.type == 'shardId') {
		return (shardId = message.data.shardId);
	}
});

const { Guilds, GuildMembers, GuildMessages, GuildMessageReactions } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember, Reaction } = Partials;

const client = new Client({
	intents: [Guilds, GuildMembers, GuildMessages, GuildMessageReactions],
	partials: [User, Message, GuildMember, ThreadMember, Reaction],
});

logger.info('Initializing bot with shard ID: ' + shardId);
client.init().catch((err) => logger.error(err));
