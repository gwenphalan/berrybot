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
import { logger, prettyError } from '@/core/logging/Logger';
import { ComponentManager } from '@/core/managers/ComponentManager';
import { parseCustomId } from '@/core/utils/CustomIdUtils';
import { error as errorMessageBuilder } from '@/messages/general/error';
import { randomUUID } from 'crypto';
import { database } from '@/core/config/database';
import { buildErrorLogMessage } from '@/commands/dev/error-log';

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
		logger.debug(
			`[MessageComponent.parseData] Parsed component data - ID: ${customId}, No data`
		);
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
		`[MessageComponent.parseData] Parsed component data - ID: ${id}, Parent: ${parent || 'none'}, Group: ${group || 'none'}, Has data: ${!!data}`
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
		logger.debug({ interaction }, '[MessageComponent.execute] Received interaction');

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
			`[MessageComponent.execute] Received message component interaction: ${'customId' in messageComponentInteraction ? messageComponentInteraction.customId : 'N/A'}`
		);

		logger.debug(
			`[MessageComponent.execute] Custom ID: ${messageComponentInteraction.customId}`
		);

		// Parse the component's customId to get its ID and any stored data
		const data =
			'customId' in messageComponentInteraction
				? parseCustomId(messageComponentInteraction.customId)
				: { id: '', data: undefined };

		logger.debug({ data }, '[MessageComponent.execute] Parsed data');

		// FLOW ROUTING: If sessionId is present, route to the flow handler
		if (data.sessionId) {
			const flowHandler = client.flowManager.getHandler(data.sessionId);
			if (flowHandler) {
				await flowHandler.handle(
					messageComponentInteraction as any, // Cast to any to satisfy all interaction types
					client,
					data.data
				);
				return;
			} else {
				logger.warn(`No flow handler found for sessionId: ${data.sessionId}`);
			}
		}

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
		logger.debug(`[MessageComponent.execute] Component type: ${type}`);

		// Build the hierarchical key for lookup
		let key: string;
		if (data.parent && data.group) {
			key = `${data.parent}:${data.group}:${data.id}`;
		} else if (data.parent) {
			key = `${data.parent}:${data.id}`;
		} else {
			key = data.id;
		}

		// Use ComponentManager for lookup
		const manager: ComponentManager = client.componentManager;
		const component = manager.get(key, type);
		if (!component) {
			logger.warn(`Component handler not found: ${key}:${type}`);
			return;
		}
		logger.debug(`[MessageComponent.execute] Found component handler: ${key}:${type}`);

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
				`[MessageComponent.execute] User ${messageComponentInteraction.user.id} has required permissions for component: ${key}:${type}`
			);
		}

		try {
			// Handle different types of components
			if (
				'isButton' in messageComponentInteraction &&
				messageComponentInteraction.isButton()
			) {
				// Handle button interactions
				logger.debug(
					`[MessageComponent.execute] Executing button component: ${key}:${type}`
				);
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
				logger.debug(
					`[MessageComponent.execute] Executing select menu component: ${key}:${type}`
				);
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
				logger.debug(
					`[MessageComponent.execute] Executing modal component: ${key}:${type}`
				);
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
				logger.debug(
					`[MessageComponent.execute] Executing user select menu component: ${key}:${type}`
				);
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
				logger.debug(
					`[MessageComponent.execute] Executing role select menu component: ${key}:${type}`
				);
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
				logger.debug(
					`[MessageComponent.execute] Executing channel select menu component: ${key}:${type}`
				);
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
				logger.debug(
					`[MessageComponent.execute] Executing mentionable select menu component: ${key}:${type}`
				);
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
			const errorId = randomUUID();
			prettyError(logger, {
				errorId,
				command: key,
				subcommand: type,
				user: messageComponentInteraction.user.id,
				guild: messageComponentInteraction.guild?.id || null,
				message: error instanceof Error ? error.message : String(error),
				error: error instanceof Error ? error : String(error),
			});

			// Upload error to database
			try {
				await database.errorLogs.create({
					errorId,
					command: key,
					subcommand: type,
					user: messageComponentInteraction.user.id,
					guild: messageComponentInteraction.guild?.id || null,
					errorMessage: error instanceof Error ? error.message : String(error),
					stackTrace: error instanceof Error && error.stack ? error.stack : '',
				});
			} catch (dbError) {
				logger.error(
					{ dbError },
					'[MessageComponent.execute] Failed to upload error to database'
				);
			}

			// Send error log to error log channel if configured
			if (config.error_log_channel) {
				try {
					const channel = await client.channels.fetch(config.error_log_channel);
					if (channel && 'send' in channel) {
						const log = {
							errorId,
							command: key,
							subcommand: type,
							user: messageComponentInteraction.user.id,
							guild: messageComponentInteraction.guild?.id || null,
							errorMessage: error instanceof Error ? error.message : String(error),
							stackTrace:
								error instanceof Error && error.stack
									? error.stack.slice(0, 1500)
									: '',
							createdAt: new Date(),
						};
						const container = buildErrorLogMessage(log as any, client);
						await channel.send({
							flags: 1 << 23, // MessageFlags.IsComponentsV2
							components: [container],
						});
					}
				} catch (sendError) {
					logger.error(
						{ sendError },
						'[MessageComponent.execute] Failed to send error log to channel'
					);
				}
			}

			try {
				const errorMsg = await errorMessageBuilder.build(
					client,
					error instanceof Error ? error : new Error(String(error)),
					errorId
				);
				// Only use editReply if isFromMessage exists and returns true
				if (
					'message' in messageComponentInteraction &&
					typeof (messageComponentInteraction as any).isFromMessage === 'function' &&
					(messageComponentInteraction as any).isFromMessage()
				) {
					await messageComponentInteraction.editReply({
						...errorMsg,
					});
				} else if (
					messageComponentInteraction.replied ||
					messageComponentInteraction.deferred
				) {
					await messageComponentInteraction.followUp({
						...errorMsg,
						ephemeral: true,
					});
				} else {
					await messageComponentInteraction.reply({
						...errorMsg,
						ephemeral: true,
					});
				}
			} catch (err) {
				logger.error({ err }, '[MessageComponent.execute] Failed to send error reply');
			}
		}
		return;
	},
};
