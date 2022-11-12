import { GatewayIntentBits, Partials } from 'discord.js';
import { Client } from './interfaces';
export * as util from './util';
export * as handlers from './handlers';
export * as interfaces from './interfaces';
export * as messages from './messages';

var shardId: any;

const setLogPrefix = () => {
    const LOG_PREFIX = `${
        new Date().getMonth() + 1
    }.${new Date().getDate()}.${new Date().getFullYear()} > ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getMinutes()} > SHARD ${shardId}`;

    var log = console.log;

    console.log = function () {
        var args = Array.from(arguments);
        args.unshift(LOG_PREFIX + ' > ');
        log.apply(console, args);
    };
};

process.on('message', (message: any) => {
    if (!message.type) return false;

    if (message.type == 'shardId') {
        shardId = message.data.shardId;
        return setLogPrefix();
    }
});

const { Guilds, GuildMembers, GuildMessages, GuildMessageReactions } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember, Reaction } = Partials;

const client = new Client({
    intents: [Guilds, GuildMembers, GuildMessages, GuildMessageReactions],
    partials: [User, Message, GuildMember, ThreadMember, Reaction]
});

client.init().catch(err => console.log(err));
