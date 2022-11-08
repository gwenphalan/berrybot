import { Collection, Client as BaseClient } from 'discord.js';
import { config } from '../config';
import { database } from '../database';
import { loadComponents, loadEvents } from '../handlers';
import type { BaseCommand, SubCommand } from './Command';
import type { Event } from './Event';
import { BaseMessageComponent, MessageComponent } from './MessageComponent';

export class Client extends BaseClient {
    commands = new Collection<string, BaseCommand>();
    subCommands = new Collection<string, SubCommand>();
    events = new Collection<string, Event['execute']>();
    messageComponents = new Collection<string, BaseMessageComponent | MessageComponent>();
    database = database;

    async init() {
        this.events = new Collection();
        this.messageComponents = new Collection();
        await loadEvents(this);
        loadComponents(this);
        return this.login(config.token);
    }

    async getCustomID(id: string, data: any): Promise<string> {
        const dataString = JSON.stringify(data, null, 0);

        const value = `${id}[${dataString}]`;

        if (value.length > 100) throw new Error('Custom ID is too long. Cannot be longer than 100 characters.');

        return value;
    }
}
