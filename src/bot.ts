import { Collection, GatewayIntentBits, Partials } from 'discord.js';
import { Client } from './interfaces/Client';
import { config } from '../config';
import { loadEvents } from './handlers/EventHandler';

var shardId: any;

const setLogPrefix = () => {
    const LOG_PREFIX = `${
        new Date().getMonth() + 1
    }.${new Date().getDate()}.${new Date().getFullYear()} > ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getMinutes()} > SHARD ${shardId}`;

    var log = console.log;

    console.log = function () {
        // 1. Convert args to a normal array
        var args = Array.from(arguments);
        // OR you can use: Array.prototype.slice.call( arguments );

        // 2. Prepend log prefix log string
        args.unshift(LOG_PREFIX + ' > ');

        // 3. Pass along arguments to console.log
        log.apply(console, args);
    };
};

// This is where your Discord bot's code is.
process.on('message', (message: any) => {
    if (!message.type) return false;

    if (message.type == 'shardId') {
        shardId = message.data.shardId;
        return setLogPrefix();
    }
});

// adding a tag to all console logs!

const { Guilds, GuildMembers, GuildMessages } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember, Reaction } = Partials;

const client = new Client({
    intents: [Guilds, GuildMembers, GuildMessages],
    partials: [User, Message, GuildMember, ThreadMember, Reaction]
});

// Bot events
client.events = new Collection();
loadEvents(client);

// Bot commands
client.commands = new Collection();

client.subCommands = new Collection();

// Login to Discord Bot

client.login(config.token);
