import { Collection, Client as BaseClient, GatewayIntentBits, Partials } from 'discord.js';
import { config } from '../config';
import { database } from '../database';
import { loadComponents, loadEvents } from '../handlers';
import type { BaseCommand, SubCommand } from './Command';
import type { Event } from './Event';
import { BaseMessageComponent, MessageComponent } from './MessageComponent';
import { logger } from '../util';
import { compressToUTF16 } from 'lz-string';
import { FlowManager } from '../handlers/FlowManager';
import components from '@/components';
/**
 * Extended Discord.js Client class that adds custom functionality
 * for command handling, event management, and component interactions
 */
export class Client extends BaseClient {
	/** Collection of registered slash commands */
	commands = new Collection<string, BaseCommand>();
	/** Collection of registered subcommands */
	subCommands = new Collection<string, SubCommand>();
	/** Collection of registered event handlers */
	events = new Collection<string, Event['execute']>();
	/** Collection of registered message components (buttons, select menus, modals) */
	messageComponents = new Collection<string, BaseMessageComponent | MessageComponent>();
	/** import of all components */
	componentBuilders = components;
	// Flow Handler
	flowManager = new FlowManager(this);
	/** Database instance for data persistence */
	database = database;

	/**
	 * Creates a new Client instance with specified intents and partials
	 * @param config - Configuration object containing intents and partials
	 */
	constructor(config: { intents: GatewayIntentBits[]; partials: Partials[] }) {
		super({
			intents: config.intents,
			partials: config.partials,
		});
		logger.debug('Client instance created with intents and partials');
	}

	/**
	 * Initializes the client by loading events and components, then logs in
	 * @returns Promise that resolves when the client is ready
	 */
	async init() {
		logger.debug('Initializing client...');

		// Instantiate collections
		logger.debug('Instantiating collections...');
		this.events = new Collection();
		this.messageComponents = new Collection();
		logger.debug('Collections instantiated');

		// Load events and components
		logger.debug('Loading events and components...');
		await loadEvents(this);
		loadComponents(this);
		logger.debug('Events and components loaded');

		// Login to Discord
		logger.debug('Logging in to Discord...');
		return this.login(config.token);
	}

	/**
	 * Generates a custom ID for message components with optional compressed data
	 * @param id - Base component ID
	 * @param data - Optional data to be compressed and included in the custom ID
	 * @returns Formatted custom ID string
	 */
	getCustomID(id: string, data?: any): string {
		logger.debug(`Generating custom ID for component: ${id}`);

		if (!data || Object.keys(data).length === 0 || data === undefined) {
			logger.debug(`No data provided, returning base ID: ${id}`);
			return id;
		}

		const dataJson = JSON.stringify(data, null, 0);
		const compressed = compressToUTF16(dataJson);
		const value = `${id}[${compressed.length < dataJson.length ? compressed : dataJson}]`;

		logger.debug(
			{
				componentId: id,
				jsonLength: dataJson.length,
				compressedLength: compressed.length,
				isCompressed: compressed.length < dataJson.length,
				finalLength: value.length,
			},
			'Custom ID generation details'
		);

		// Log compression details
		logger.debug(`Data JSON (Length: ${dataJson.length}): ${dataJson}`);
		logger.debug(`Data String (Length: ${compressed.length}): ${compressed}`);
		logger.debug(`Data Compressed: ${compressed.length < dataJson.length}`);

		// Check if custom ID exceeds Discord's limit
		if (value.length > 100) {
			logger.error(
				{
					componentId: id,
					totalLength: value.length,
					idLength: id.length,
					dataLength: value.length - id.length,
				},
				'Custom ID exceeds Discord limit of 100 characters'
			);
			return id;
		}

		logger.debug(`Generated custom ID: ${value}`);
		return value;
	}
}
