import {
	BaseInteraction,
	Events,
	PermissionsBitField,
	StringSelectMenuInteraction,
	InteractionType,
	MessageComponentInteraction,
	ModalSubmitInteraction,
} from 'discord.js';
import { config } from '../../config';
import { Client, Event } from '../../interfaces';
import {
	ButtonComponent,
	ModalComponent,
	MultiSelectMenuComponent,
	SingleSelectMenuComponent,
} from '../../interfaces/MessageComponent';
import { decompressFromUTF16 } from 'lz-string';
import { logger } from '../../util';

/**
 * Parses component customId to extract component ID and any compressed data
 * Format: componentId[compressedData]
 */
export function parseData(customId: string): {
	id: string;
	data: ((this: any, key: string, value: any) => any) | undefined;
} {
	const regex = /\[(.*)\]/;
	const match = regex.exec(customId);
	if (match) {
		const data = JSON.parse(decompressFromUTF16(match[1]));
		const id = customId.replace(regex, '');
		logger.debug(`Parsed component data - ID: ${id}, Has data: ${!!data}`);
		return { id, data };
	}
	logger.debug(`Parsed component data - ID: ${customId}, No data`);
	return { id: customId, data: undefined };
}

// Event handler for message component interactions (buttons, select menus, modals)
export const event: Event = {
	name: Events.InteractionCreate,
	/**
	 * Handles all types of message component interactions
	 * @param {MessageComponentInteraction} interaction - The interaction object from Discord
	 */
	execute(interaction: BaseInteraction, client: Client) {
		// Only handle message component interactions
		if (interaction.type !== InteractionType.MessageComponent) return;
		const messageComponentInteraction = interaction as MessageComponentInteraction;

		logger.debug(
			`Received message component interaction: ${messageComponentInteraction.customId}`
		);

		// Parse the component's customId to get its ID and any stored data
		const data = parseData(messageComponentInteraction.customId);

		// Determine the type of component being interacted with
		let type: 'button' | 'selectMenu' | 'modal';
		if (messageComponentInteraction.isButton()) {
			type = 'button';
		} else if (messageComponentInteraction.isStringSelectMenu()) {
			type = 'selectMenu';
		} else {
			type = 'modal';
		}
		logger.debug(`Component type: ${type}`);

		// Get the component handler from our collection
		const componentName = `${data.id}:${type}`;
		const component = client.messageComponents.get(componentName);
		if (!component) {
			logger.warn(`Component handler not found: ${componentName}`);
			return;
		}
		logger.debug(`Found component handler: ${componentName}`);

		// Check if component is developer-only
		if (component.developer && config.developer !== messageComponentInteraction.user.id) {
			logger.warn(
				`User ${messageComponentInteraction.user.id} attempted to use developer-only component: ${componentName}`
			);
			return messageComponentInteraction.reply({
				content: 'This is a developer only component.',
				ephemeral: true,
			});
		}

		// Check user permissions if component requires them
		const member = messageComponentInteraction.member
			? messageComponentInteraction.guild?.members.cache.get(
					messageComponentInteraction.member.user.id
				)
			: null;

		if (member) {
			const permissions = new PermissionsBitField();
			component.permissions?.forEach((p) => permissions.add(p));

			if (!member.permissions.has(permissions)) {
				logger.warn(
					`User ${messageComponentInteraction.user.id} lacks permissions for component: ${componentName}`
				);
				return messageComponentInteraction.reply({
					content: 'You do not have permission to do this.',
					ephemeral: true,
				});
			}
			logger.debug(
				`User ${messageComponentInteraction.user.id} has required permissions for component: ${componentName}`
			);
		}

		try {
			// Handle different types of components
			if (messageComponentInteraction.isButton()) {
				// Handle button interactions
				logger.debug(`Executing button component: ${componentName}`);
				const button: ButtonComponent = component as ButtonComponent;
				button.execute(messageComponentInteraction, client, data.data);
			} else if (messageComponentInteraction.isStringSelectMenu()) {
				// Handle select menu interactions
				logger.debug(`Executing select menu component: ${componentName}`);
				const selectMenu: SingleSelectMenuComponent | MultiSelectMenuComponent =
					component as SingleSelectMenuComponent | MultiSelectMenuComponent;
				const stringInteraction =
					messageComponentInteraction as StringSelectMenuInteraction;
				const options = stringInteraction.component.options;
				const selectedOptions = stringInteraction.values;
				const selectedOption = options.find(
					(option) => option.value === selectedOptions[0]
				);

				if (selectMenu.multi_select) {
					// Handle multi-select menus
					logger.debug(
						`Executing multi-select menu with ${selectedOptions.length} selections`
					);
					selectMenu.execute(
						messageComponentInteraction,
						client,
						options.filter((option) => selectedOptions.includes(option.value)),
						data.data
					);
				} else {
					// Handle single-select menus
					if (!selectedOption) {
						logger.warn(
							`No valid option selected in single-select menu: ${componentName}`
						);
						return messageComponentInteraction.reply({
							content: 'Something went wrong with your selection!',
							ephemeral: true,
						});
					}
					logger.debug(
						`Executing single-select menu with selection: ${selectedOption.value}`
					);
					selectMenu.execute(
						messageComponentInteraction,
						client,
						selectedOption,
						data.data
					);
				}
			} else if (messageComponentInteraction.isModalSubmit()) {
				// Handle modal submissions
				logger.debug(`Executing modal component: ${componentName}`);
				const modal: ModalComponent = component as ModalComponent;
				const modalInteraction = messageComponentInteraction as ModalSubmitInteraction;
				const fields = modalInteraction.fields.fields;
				modal.execute(modalInteraction, client, fields, data.data);
			}
		} catch (error) {
			logger.error(
				{
					error,
					component: componentName,
					type,
					user: messageComponentInteraction.user.id,
					guild: messageComponentInteraction.guild?.id,
				},
				'Error executing message component'
			);
		}
		return;
	},
};
