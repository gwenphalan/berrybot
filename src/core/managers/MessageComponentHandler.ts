import type { Client } from '@/core/client/BerryClient';
import { BaseMessageComponent } from '../interfaces/MessageComponent';
import { Files, logger } from '@/core/utils';
import AsciiTable from 'ascii-table';
import { Collection } from 'discord.js';

// ComponentManager for registration, retrieval, and validation
export class ComponentManager {
	private readonly components = new Collection<string, BaseMessageComponent>();
	private readonly client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	register<T extends BaseMessageComponent>(component: T, type: string): void {
		let key: string;
		if (component.parent && component.group) {
			key = `${component.parent}:${component.group}:${component.id}`;
		} else if (component.parent) {
			key = `${component.parent}:${component.id}`;
		} else {
			key = component.id;
		}
		key += `:${type.toLowerCase()}`;
		if (this.components.has(key)) {
			logger.warn(`Component with key ${key} already registered. Overwriting.`);
		}
		this.components.set(key, component);
	}

	get<T extends BaseMessageComponent>(id: string, type: string): T | undefined {
		const key = `${id}:${type.toLowerCase()}`;
		return this.components.get(key) as T | undefined;
	}

	clear() {
		this.components.clear();
	}

	size() {
		return this.components.size;
	}

	filterByType(type: string) {
		return this.components.filter((c, k) => k.endsWith(':' + type));
	}

	all() {
		return this.components;
	}
}

// Main function to load and register all message components (buttons, select menus, modals)
export const loadComponents = async (client: Client) => {
	const table = new AsciiTable().setHeading('Type', 'Name', 'Status');

	// Use ComponentManager for component registration
	/** @ts-expect-error: componentManager is a runtime extension of Client for component management */
	if (!client.componentManager) {
		/** @ts-expect-error: componentManager is a runtime extension of Client for component management */
		client.componentManager = new ComponentManager(client);
	}
	/** @ts-expect-error: componentManager is a runtime extension of Client for component management */
	const manager = client.componentManager as ComponentManager;

	// Clear existing components before loading new ones in case of reload
	logger.debug('Clearing existing message components...');
	manager.clear();
	logger.debug(`Cleared ${manager.size()} existing components`);

	// Define supported component types
	const types = ['button', 'selectMenu', 'modal'];
	logger.debug(`Supported component types: ${types.join(', ')}`);

	logger.info('Loading message components...');

	// Process each component type
	for (let i = 0; i < types.length; i++) {
		logger.debug(`Loading ${types[i]} components...`);
		// Load all components of current type from their respective directory
		const components = await Files.load(`components/${types[i]}s`);
		logger.debug(`Found ${components.length} ${types[i]} components to load`);

		// Process each component file
		for (const c of components) {
			const componentName = c.split('/')[c.split('/').length - 1].split('.')[0];
			logger.debug(`Processing ${types[i]} component: ${componentName}`);
			try {
				// Load and validate component
				const imported = await import(c);
				const component: BaseMessageComponent =
					imported.default || imported.MessageComponent;
				if (!component)
					throw new Error(
						'No component export found (expected default or MessageComponent)'
					);
				logger.debug(`Successfully loaded component: ${componentName}`);

				const name = component.id;
				logger.debug(`Component ID: ${name}`);

				// Register component with type identifier for easy lookup
				manager.register(component, types[i]);
				logger.debug(`Registered component: ${name}:${types[i]}`);

				table.addRow(types[i], name, '🟩');
			} catch (error) {
				logger.error(`Error loading component ${componentName}: ${error}`);
				logger.debug(`Failed to load component ${componentName} from path: ${c}`);
				table.addRow(types[i], componentName, '🟥');
			}
		}
	}

	// Display component loading results
	logger.info('\n' + table.toString());
	logger.info(`Message Components Loaded - Total: ${manager.size()}`);
	logger.debug(
		`Component breakdown: ${types
			.map((type) => `${type}s: ${manager.filterByType(type).size}`)
			.join(', ')}`
	);
};
