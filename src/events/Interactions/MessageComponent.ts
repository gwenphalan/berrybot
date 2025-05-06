import {
	BaseInteraction,
	Events,
	PermissionsBitField,
	StringSelectMenuInteraction,
	InteractionType,
	MessageComponentInteraction,
	ModalSubmitInteraction,
} from 'discord.js';
import { config } from '@/core/config/config';
import type { Client, Event } from '@/core/interfaces';
import { decompressFromUTF16 } from 'lz-string';
import { logger } from '@/core/logging/Logger';
import { ComponentManager } from '@/core/managers/MessageComponentHandler';
import { parseCustomId } from '@/core/utils/CustomIdUtils';

/**
 * Parses component customId to extract component ID, parent, group, and any compressed data
 * customID Format: "parent:componentId[compressedData]"
 * customID Format: "componentId[compressedData]"
 * customID Format: "parent:componentId"
 * customID Format: "parent:group:componentId[compressedData]"
 * customID Format: "parent:group:componentId"
 *
 * returns: {
 *  id: string;
 *  parent?: string;
 *  group?: string;
 *  data?: Record<string, any> | undefined;
 * }
 */
export function parseData(customId: string): {
	id: string;
	parent?: string;
	group?: string;
	data: Record<string, any> | undefined;
} {
	// Match format: (parent:)?(group:)?id[compressedData]
	const regex = /^(?:([^:]+):)?(?:([^:]+):)?([^[]+)(?:\[(.*)\])?$/;
	const match = regex.exec(customId);

	if (!match) {
		logger.debug(`Parsed component data - ID: ${customId}, No data`);
		return { id: customId, data: undefined };
	}

	const [, parent, group, id, compressedData] = match;

	let data;
	try {
		// Handle empty objects or invalid JSON
		if (!compressedData || compressedData === '{}') {
			data = {};
		} else {
			data = JSON.parse(decompressFromUTF16(compressedData));
		}
	} catch (error: any) {
		logger.warn(`Failed to parse data from customId: ${customId}. Error: ${error.message}`);
		data = {};
	}

	logger.debug(
		`Parsed component data - ID: ${id}, Parent: ${parent || 'none'}, Group: ${group || 'none'}, Has data: ${!!data}`
	);

	return { id, parent, group, data };
}

// Event handler for message component interactions (buttons, select menus, modals)
export const event: Event = {
	name: Events.InteractionCreate,
	/**
	 * Handles all types of message component interactions
	 * @param {MessageComponentInteraction} interaction - The interaction object from Discord
	 */
	execute: async function (interaction: BaseInteraction, client: Client) {
		logger.debug({ interaction }, 'Received interaction');

		// Only handle message component and modal submit interactions
		if (
			interaction.type !== InteractionType.MessageComponent &&
			interaction.type !== InteractionType.ModalSubmit
		)
			return;
		const messageComponentInteraction = interaction as
			| MessageComponentInteraction
			| ModalSubmitInteraction;

		logger.debug(
			`Received message component interaction: ${'customId' in messageComponentInteraction ? messageComponentInteraction.customId : 'N/A'}`
		);

		// Parse the component's customId to get its ID and any stored data
		const data =
			'customId' in messageComponentInteraction
				? parseCustomId(messageComponentInteraction.customId)
				: { id: '', data: undefined };

		// Determine the type of component being interacted with
		let type: 'button' | 'selectMenu' | 'modal';
		if ('isButton' in messageComponentInteraction && messageComponentInteraction.isButton()) {
			type = 'button';
		} else if (
			'isStringSelectMenu' in messageComponentInteraction &&
			messageComponentInteraction.isStringSelectMenu()
		) {
			type = 'selectMenu';
		} else if (
			'isModalSubmit' in messageComponentInteraction &&
			messageComponentInteraction.isModalSubmit()
		) {
			type = 'modal';
		} else {
			logger.warn('Unknown component interaction type');
			return;
		}
		logger.debug(`Component type: ${type}`);

		// Build the hierarchical key for lookup
		let key: string;
		if (data.parent && data.group) {
			key = `${data.parent}:${data.group}:${data.id}`;
		} else if (data.parent) {
			key = `${data.parent}:${data.id}`;
		} else {
			key = data.id;
		}
		key += `:${type}`;

		// Use ComponentManager for lookup
		/** @ts-expect-error: componentManager is a runtime extension of Client for component management */
		const manager: ComponentManager = client.componentManager;
		const component = manager.get(key, type);
		if (!component) {
			logger.warn(`Component handler not found: ${key}:${type}`);
			return;
		}
		logger.debug(`Found component handler: ${key}:${type}`);

		// Check if component is developer-only
		if (component.developer && config.developer !== messageComponentInteraction.user.id) {
			logger.warn(
				`User ${messageComponentInteraction.user.id} attempted to use developer-only component: ${key}:${type}`
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
			component.permissions?.forEach((p: bigint) => permissions.add(p));

			if (!member.permissions.has(permissions)) {
				logger.warn(
					`User ${messageComponentInteraction.user.id} lacks permissions for component: ${key}:${type}`
				);
				return messageComponentInteraction.reply({
					content: 'You do not have permission to do this.',
					ephemeral: true,
				});
			}
			logger.debug(
				`User ${messageComponentInteraction.user.id} has required permissions for component: ${key}:${type}`
			);
		}

		try {
			// Handle different types of components
			if (
				'isButton' in messageComponentInteraction &&
				messageComponentInteraction.isButton()
			) {
				// Handle button interactions
				logger.debug(`Executing button component: ${key}:${type}`);
				await component.execute(
					messageComponentInteraction,
					client,
					data.data,
					messageComponentInteraction.guild ?? undefined
				);
			} else if (
				'isStringSelectMenu' in messageComponentInteraction &&
				messageComponentInteraction.isStringSelectMenu()
			) {
				// Handle select menu interactions
				logger.debug(`Executing select menu component: ${key}:${type}`);
				const stringInteraction =
					messageComponentInteraction as StringSelectMenuInteraction;
				const options = stringInteraction.component.options;
				const selectedOptions = stringInteraction.values;
				const selectedOption = options.find(
					(option) => option.value === selectedOptions[0]
				);

				if (component.multi_select) {
					// Handle multi-select menus
					logger.debug(
						`Executing multi-select menu with ${selectedOptions.length} selections`
					);
					await component.execute(
						messageComponentInteraction,
						client,
						data.data,
						messageComponentInteraction.guild ?? undefined,
						undefined,
						options.filter((option: import('discord.js').APISelectMenuOption) =>
							selectedOptions.includes(option.value)
						)
					);
				} else {
					// Handle single-select menus
					if (!selectedOption) {
						logger.warn(
							`No valid option selected in single-select menu: ${key}:${type}`
						);
						return messageComponentInteraction.reply({
							content: 'Something went wrong with your selection!',
							ephemeral: true,
						});
					}
					logger.debug(
						`Executing single-select menu with selection: ${selectedOption.value}`
					);
					await component.execute(
						messageComponentInteraction,
						client,
						data.data,
						messageComponentInteraction.guild ?? undefined,
						undefined,
						selectedOption
					);
				}
			} else if (
				'isModalSubmit' in messageComponentInteraction &&
				messageComponentInteraction.isModalSubmit()
			) {
				// Handle modal submissions
				logger.debug(`Executing modal component: ${key}:${type}`);
				const modalInteraction = messageComponentInteraction as ModalSubmitInteraction;
				const fields = modalInteraction.fields.fields;
				await component.execute(
					modalInteraction,
					client,
					data.data,
					modalInteraction.guild ?? undefined,
					fields
				);
			} else if (
				'messageComponentInteraction' in { messageComponentInteraction } &&
				(messageComponentInteraction as any).isUserSelectMenu &&
				(messageComponentInteraction as any).isUserSelectMenu()
			) {
				const userSelect =
					messageComponentInteraction as import('discord.js').UserSelectMenuInteraction;
				logger.debug(`Executing user select menu component: ${key}:${type}`);
				await component.execute(
					userSelect,
					client,
					data.data,
					userSelect.guild ?? undefined,
					undefined,
					undefined
				);
			} else if (
				'messageComponentInteraction' in { messageComponentInteraction } &&
				(messageComponentInteraction as any).isRoleSelectMenu &&
				(messageComponentInteraction as any).isRoleSelectMenu()
			) {
				const roleSelect =
					messageComponentInteraction as import('discord.js').RoleSelectMenuInteraction;
				logger.debug(`Executing role select menu component: ${key}:${type}`);
				await component.execute(
					roleSelect,
					client,
					data.data,
					roleSelect.guild ?? undefined,
					undefined,
					undefined
				);
			} else if (
				'messageComponentInteraction' in { messageComponentInteraction } &&
				(messageComponentInteraction as any).isChannelSelectMenu &&
				(messageComponentInteraction as any).isChannelSelectMenu()
			) {
				const channelSelect =
					messageComponentInteraction as import('discord.js').ChannelSelectMenuInteraction;
				logger.debug(`Executing channel select menu component: ${key}:${type}`);
				await component.execute(
					channelSelect,
					client,
					data.data,
					channelSelect.guild ?? undefined,
					undefined,
					undefined
				);
			} else if (
				'messageComponentInteraction' in { messageComponentInteraction } &&
				(messageComponentInteraction as any).isMentionableSelectMenu &&
				(messageComponentInteraction as any).isMentionableSelectMenu()
			) {
				const mentionableSelect =
					messageComponentInteraction as import('discord.js').MentionableSelectMenuInteraction;
				logger.debug(`Executing mentionable select menu component: ${key}:${type}`);
				await component.execute(
					mentionableSelect,
					client,
					data.data,
					mentionableSelect.guild ?? undefined,
					undefined,
					undefined
				);
			}
		} catch (error) {
			logger.error(
				{
					error,
					component: `${key}:${type}`,
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
