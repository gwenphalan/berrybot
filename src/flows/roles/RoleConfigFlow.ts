import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Message,
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
	PermissionsBitField,
	BaseMessageOptions,
} from 'discord.js';
import { BaseFlowHandler, FlowState, FlowTransition } from '@/core/interfaces/Flow';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import { MainMenu, CategorySelect } from '@/messages/roles';
import CategoryDeleteConfirmation from '@/components/modals/roles/category-delete-confirmation';

/**
 * FlowName - Flow Description
 * Handles flow functionality description
 */
export class RoleConfigFlow extends BaseFlowHandler {
	// Unique identifier for this flow type
	id = 'ROLE_CONFIG';

	// Initial state of the flow
	state: FlowState = {
		id: 'main-menu',
		data: {},
	};

	ephemeral = true;

	// Define the state schema
	stateSchema = {
		required: [],
		optional: ['action', 'category', 'roles', 'name'],
		validate: (_state: FlowState) => {
			return true;
		},
	};

	// Define security checks
	security = {
		checkPermissions: async (
			interaction:
				| ButtonInteraction
				| StringSelectMenuInteraction
				| ModalSubmitInteraction
				| ChatInputCommandInteraction
		) => {
			// Add your permission checks here
			if (interaction.guild) {
				const permissions = interaction.member?.permissions;
				return permissions instanceof PermissionsBitField
					? permissions.has(PermissionsBitField.Flags.ManageRoles)
					: false;
			}
			return false;
		},
		checkState: async (_state: FlowState) => {
			// Add your state validation here
			return true;
		},
	};

	constructor(client: Client) {
		super(client);
		logger.debug(
			{ flowId: this.id },
			'[RoleConfigFlow.constructor] RoleConfigFlow instance created'
		);
	}

	/**
	 * Builds or updates the flow's message content.
	 * This method is called when:
	 * 1. The flow is first created (new message)
	 * 2. The message needs to be updated (existing message)
	 * @param client The Discord client
	 * @param state The current flow state
	 * @param locale The resolved locale (always provided by BaseFlowHandler)
	 */
	async build(
		client: Client,
		state: FlowState,
		locale?: string
	): Promise<Message | void | BaseMessageOptions> {
		logger.debug({ flowId: this.id, state }, '[RoleConfigFlow.build] START');
		try {
			logger.debug(
				{ flowId: this.id, stateId: state.id, state },
				'[RoleConfigFlow.build] Building for state.id'
			);
			const { interaction } = state || {};
			logger.debug(
				{ flowId: this.id, interactionType: interaction?.constructor?.name, interaction },
				'[RoleConfigFlow.build] Interaction extracted'
			);
			let messageOpts: BaseMessageOptions = {
				embeds: [],
				components: [],
			};

			// Locale is now always provided by the base class

			// Build your message here
			switch (state.id) {
				case 'main-menu':
					logger.debug(
						{ flowId: this.id, state },
						'[RoleConfigFlow.build] Calling MainMenu.build'
					);
					messageOpts = await MainMenu.build(
						client,
						state,
						undefined,
						state.sessionId,
						locale
					);
					logger.debug(
						{ flowId: this.id, messageOpts },
						'[RoleConfigFlow.build] MainMenu.build result'
					);
					break;
				case 'category-select':
					logger.debug(
						{ flowId: this.id, state },
						'[RoleConfigFlow.build] Calling CategorySelect.build'
					);
					messageOpts = await CategorySelect.build(
						client,
						interaction?.guildId,
						state,
						state.sessionId,
						locale
					);
					logger.debug(
						{ flowId: this.id, messageOpts },
						'[RoleConfigFlow.build] CategorySelect.build result'
					);
					break;
				case 'category-name-input':
					logger.debug(
						{ flowId: this.id, state },
						'[RoleConfigFlow.build] category-name-input state - no builder'
					);
					break;
				case 'channel-select':
					logger.debug(
						{ flowId: this.id, state },
						'[RoleConfigFlow.build] channel-select state - no builder'
					);
					break;
				case 'role-select':
					logger.debug(
						{ flowId: this.id, state },
						'[RoleConfigFlow.build] role-select state - no builder'
					);
					break;
				case 'category-edit':
					logger.debug(
						{ flowId: this.id, state },
						'[RoleConfigFlow.build] category-edit state - no builder'
					);
					break;
				case 'category-delete-confirmation':
					logger.debug(
						{ flowId: this.id, state },
						'[RoleConfigFlow.build] category-delete-confirmation state'
					);
					if (
						state.interaction instanceof ButtonInteraction ||
						state.interaction instanceof StringSelectMenuInteraction ||
						state.interaction instanceof ChatInputCommandInteraction
					) {
						const category =
							state.data && state.data.category ? state.data.category : '';
						logger.debug(
							{ flowId: this.id, category },
							'[RoleConfigFlow.build] category-delete-confirmation: category value'
						);
						if (!category || typeof category !== 'string' || category.length < 1) {
							logger.error(
								{ flowId: this.id, state },
								'Cannot show delete confirmation: category is missing or empty'
							);
							if (state.interaction && 'reply' in state.interaction) {
								await state.interaction.reply({
									content: 'No category selected for deletion.',
									ephemeral: true,
								});
								logger.debug(
									{ flowId: this.id },
									'[RoleConfigFlow.build] Sent missing category reply'
								);
							}
							logger.debug(
								{ flowId: this.id },
								'[RoleConfigFlow.build] Returning early due to missing category'
							);
							return;
						}
						logger.debug(
							{ flowId: this.id },
							'[RoleConfigFlow.build] Showing category delete confirmation modal'
						);
						state.interaction.showModal(
							await new CategoryDeleteConfirmation().build(client, {
								data: { category },
							})
						);
						logger.debug(
							{ flowId: this.id },
							'[RoleConfigFlow.build] Modal shown, returning'
						);
						return;
					}
					break;
			}
			return messageOpts;
		} catch (error) {
			logger.error(
				{ flowId: this.id, error, state },
				'[RoleConfigFlow.build] Error building flow'
			);
			throw error;
		} finally {
			logger.debug({ flowId: this.id, state }, '[RoleConfigFlow.build] END');
		}
	}

	/**
	 * Handles the actual interaction logic
	 * This is called by the base class after security checks
	 */
	protected async handleInteraction(
		interaction:
			| ButtonInteraction
			| StringSelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction,
		client: Client,
		state: FlowState,
		componentData?: {
			id: string;
			parent?: string;
			group?: string;
			data?: any;
		}
	): Promise<FlowTransition | void> {
		// Add your interaction handling logic here
		logger.debug(
			{ flowId: this.id, interactionId: interaction.id },
			'handleInteraction called'
		);

		if (!interaction.guild) return;

		if (interaction instanceof ChatInputCommandInteraction) {
			logger.debug(
				{ flowId: this.id, interactionId: interaction.id },
				'Returning main-menu transition'
			);
			return {
				to: 'main-menu',
				data: {},
			};
		}

		const { id, group, data } = componentData || { id: '' };

		if (interaction instanceof ButtonInteraction) {
			switch (group) {
				case 'config-main-menu':
					switch (id) {
						case 'edit':
							return {
								to: 'category-select',
							};
						case 'create':
							return {
								to: 'category-name-input',
								data: {
									action: 'create',
								},
							};
						case 'message':
							return {
								to: 'channel-select',
							};
					}
					break;
				case 'category-edit':
					switch (id) {
						case 'name':
							return {
								to: 'category-name-input',
								data: {
									action: 'edit',
									category: data?.category,
								},
							};
						case 'roles':
							return {
								to: 'role-select',
								data: {
									category: data?.category,
									action: 'edit',
								},
							};
						case 'delete':
							return {
								to: 'category-delete-confirmation',
								data: {
									category: data?.category,
								},
							};
					}
					break;
			}
		}

		if (interaction instanceof StringSelectMenuInteraction) {
			switch (id) {
				case 'category-select':
					return {
						to: 'category-edit',
						data: {
							category: data?.category,
						},
					};
				case 'role-select':
					return {
						to: 'category-edit',
						data: {
							category: data?.category,
							roles: data?.roles,
						},
					};
				case 'channel-select':
					return {
						to: 'main-menu',
					};
			}
		}

		if (interaction instanceof ModalSubmitInteraction) {
			switch (id) {
				case 'category-name-input':
					return {
						to: 'category-edit',
						data: {
							category: data?.category,
						},
					};
				case 'category-delete-confirmation':
					return {
						to: 'main-menu',
					};
			}
		}
	}

	/**
	 * Called when the flow is first initialized
	 */
	public async onStart(client: Client, state: FlowState): Promise<void> {
		logger.debug({ flowId: this.id, state }, '[RoleConfigFlow.onStart] Flow started');
	}

	/**
	 * Called when the flow ends
	 */
	public async onEnd(
		client: Client,
		state: FlowState,
		reason: 'completed' | 'cancelled' | 'timeout' | 'error'
	): Promise<void> {
		logger.debug({ flowId: this.id, state, reason }, '[RoleConfigFlow.onEnd] Flow ended');
	}

	/**
	 * Called when an error occurs
	 */
	public async onError(client: Client, state: FlowState, error: Error): Promise<void> {
		logger.error(
			{
				flowId: this.id,
				state,
				error: error.message,
				stack: error.stack,
			},
			'Flow error occurred'
		);
	}

	/**
	 * Called when the flow times out
	 */
	public async onTimeout(client: Client, state: FlowState): Promise<void> {
		logger.warn({ flowId: this.id, state }, 'Flow timed out');
	}
}
