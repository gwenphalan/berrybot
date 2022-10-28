import {Collection, Client as BaseClient} from 'discord.js';
import type {BaseCommand, SubCommand} from './command';
import type {Event} from './event';

export class Client extends BaseClient {
	commands = new Collection<string, BaseCommand>();
	subCommands = new Collection<string, SubCommand>();
	events = new Collection<string, Event['execute']>();
}
