import {Collection, Client as BaseClient } from 'discord.js';
import { Command } from './command';

export class Client extends BaseClient {
    commands: Collection<string, Command> = new Collection();
}