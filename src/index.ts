import { Collection, GatewayIntentBits, Partials } from 'discord.js';
import { Client } from './interfaces/Client';
import { config } from '../config';

const { Guilds, GuildMembers, GuildMessages } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember, Reaction } = Partials;

const client = new Client({
    intents: [Guilds, GuildMembers, GuildMessages],
    partials: [User, Message, GuildMember, ThreadMember, Reaction]
});

import { loadEvents } from './handlers/EventHandler';

// Bot events
client.events = new Collection();
loadEvents(client);

// Bot commands
client.commands = new Collection();

client.subCommands = new Collection();

// Login to Discord Bot

client.login(config.token);
