import { Collection, Client as BaseClient } from 'discord.js';
import { Command } from './command';
import { Event } from './event';

export class Client extends BaseClient {
    commands: Collection<string, Command> = new Collection();
    events: Collection<string, Event["execute"]> = new Collection();
}