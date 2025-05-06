import type { Client } from '@/core/client/BerryClient';
import { BaseMessageComponent } from '@/core/interfaces/MessageComponent';
import { Files, logger } from '@/core/utils';
import AsciiTable from 'ascii-table';

// Main function to load and register all message components (buttons, select menus, modals)
export const loadComponents = async (client: Client) => {
	const table = new AsciiTable().setHeading('Type', 'Name', 'Status');

	// Clear existing components before loading new ones in case of reload
	logger.debug('Clearing existing message components...');
	await client.messageComponents.clear();
	logger.debug(`Cleared ${client.messageComponents.size} existing components`);

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
				const component: BaseMessageComponent = (await import(c)).MessageComponent;
				logger.debug(`Successfully loaded component: ${componentName}`);

				const name = component.id;
				logger.debug(`Component ID: ${name}`);

				// Store component with type identifier for easy lookup
				client.messageComponents.set(name + ':' + types[i], component);
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
	logger.info(`Message Components Loaded - Total: ${client.messageComponents.size}`);
	logger.debug(
		`Component breakdown: ${types
			.map(
				(type) =>
					`${type}s: ${client.messageComponents.filter((c) => c.id.endsWith(':' + type)).size}`
			)
			.join(', ')}`
	);
};
