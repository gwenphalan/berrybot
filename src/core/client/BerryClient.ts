import { Collection, Client as BaseClient, GatewayIntentBits, Partials } from 'discord.js';
import { config } from '@/core/config/config';
import { database } from '@/core/config/database';
import type { BaseCommand, SubCommand } from '@/core/interfaces/Command';
import type { Event } from '@/core/interfaces/Event';
import { logger } from '@/core/logging/Logger';
import components from '@/components';
import { FlowManager } from '@/core/managers/FlowManager';
import { loadEvents } from '@/core/managers/EventHandler';
import { loadComponents, ComponentManager } from '@/core/managers/ComponentManager';
import { BaseMessageComponent } from '@/core/interfaces/MessageComponent';
import { ChannelSelectMenuComponent } from '@/core/classes/ChannelSelectMenuComponent';
import { StringSelectMenuComponent } from '@/core/classes/StringSelectMenuComponent';
import { ButtonComponent } from '@/core/classes/ButtonComponent';
import { ModalComponent } from '@/core/classes/ModalComponent';
import { UserSelectMenuComponent } from '@/core/classes/UserSelectMenuComponent';
import { RoleSelectMenuComponent } from '@/core/classes/RoleSelectMenuComponent';
import { MentionableSelectMenuComponent } from '@/core/classes/MentionableSelectMenuComponent';
import * as utils from '@/core/utils';
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
	/** import of all components */
	/** Collection of registered message components (buttons, select menus, modals) */
	messageComponents = new Collection<
		string,
		| BaseMessageComponent
		| ButtonComponent
		| StringSelectMenuComponent
		| ChannelSelectMenuComponent
		| ModalComponent
		| UserSelectMenuComponent
		| RoleSelectMenuComponent
		| MentionableSelectMenuComponent
	>();
	/** import of all components */
	componentBuilders = components;
	// Flow Handler
	flowManager = new FlowManager(this);
	/** Database instance for data persistence */
	database = database;
	/** Expose all core utilities */
	utils: typeof utils;
	componentManager: ComponentManager = new ComponentManager(this);

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
		this.utils = utils;
		this.componentManager = new ComponentManager(this);
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
	 * Retrieves an emoji from the config by name
	 * @param name - The name of the emoji to retrieve
	 * @returns The emoji object from the config
	 */
	getEmoji(name: keyof typeof config.emojis) {
		return this.emojis.cache.get(config.emojis[name]);
	}
}
