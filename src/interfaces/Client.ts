import { Collection, Client as BaseClient } from 'discord.js';
import { database } from '../database';
import { Button } from './button';
import type { BaseCommand, SubCommand } from './command';
import type { Event } from './event';
import { SelectMenu } from './selectMenu';
import util from '../util';
import { Modal } from './modal';

export class Client extends BaseClient {
    commands = new Collection<string, BaseCommand>();
    subCommands = new Collection<string, SubCommand>();
    events = new Collection<string, Event['execute']>();
    buttons = new Collection<string, Button>();
    selectMenus = new Collection<string, SelectMenu>();
    modals = new Collection<string, Modal>();
    util = util;
    database = database;
}
