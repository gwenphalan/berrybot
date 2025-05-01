import { Collection, Client as BaseClient, GatewayIntentBits, Partials } from 'discord.js';
import { config } from '../config';
import { database } from '../database';
import { loadComponents, loadEvents } from '../handlers';
import type { BaseCommand, SubCommand } from './Command';
import type { Event } from './Event';
import { BaseMessageComponent, MessageComponent } from './MessageComponent';
import { logger } from '../util';
import { compressToUTF16 } from "lz-string";

export class Client extends BaseClient {
    commands = new Collection<string, BaseCommand>();
    subCommands = new Collection<string, SubCommand>();
    events = new Collection<string, Event['execute']>();
    messageComponents = new Collection<string, BaseMessageComponent | MessageComponent>();
    database = database;

    constructor(config: { intents: GatewayIntentBits[]; partials: Partials[] }) {
        super({
            intents: config.intents,
            partials: config.partials
        });
    }

    async init() {
        this.events = new Collection();
        this.messageComponents = new Collection();
        await loadEvents(this);
        loadComponents(this);
        return this.login(config.token);
    }

    getCustomID(id: string, data: any): string {
        const dataJson = JSON.stringify(data, null, 0);
        const compressed = compressToUTF16(dataJson);
        let value = data ? `${id}[${compressed.length < dataJson.length ? compressed : dataJson}]` : id;

        logger.info(`Data JSON (Length: ${dataJson.length}): ${dataJson}`);

        logger.info(`Data String (Length: ${compressed.length}): ${compressed}`);

        logger.info(`Data Compressed: ${compressed.length < dataJson.length}`);
        

        if (value.length > 100) {
            logger.error(`Custom ID is too long. Cannot be longer than 100 characters. Please shorten the data or id you are passing to the component. Data String Length: ${value.length}, ID Length: ${id.length}`);
            return id;
        }

        return value;
    };
}
