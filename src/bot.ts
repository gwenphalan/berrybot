import { Collection, GatewayIntentBits, Partials } from 'discord.js';
import { Client } from './interfaces/Client';
import { config } from '../config';
import { loadEvents } from './handlers/EventHandler';
import { loadButtons } from './handlers/ButtonHandler';
import { loadSelectMenus } from './handlers/SelectMenuHandler';
import { loadModals } from './handlers/ModalHandler';

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

// Bot events
client.events = new Collection();
loadEvents(client);
client.commands = new Collection();
client.subCommands = new Collection();
client.buttons = new Collection();
loadButtons(client);
client.selectMenus = new Collection();
loadSelectMenus(client);
client.modals = new Collection();
loadModals(client);

// Login to Discord Bot

client.login(config.token);
