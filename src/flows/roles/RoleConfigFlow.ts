import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Message,
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
	PermissionsBitField,
	BaseMessageOptions,
} from 'discord.js';
import { BaseFlowHandler, FlowState, FlowTransition } from '@/interfaces/Flow';
import { Client } from '@/interfaces/Client';
import { logger } from '@/util/Logger';
import { parseData } from '@/events/Interactions/MessageComponent';
import { MainMenu, CategorySelect } from '@/messages/roles';

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

	// Define the state schema
	stateSchema = {
		required: [],
		optional: ['action', 'category', 'roles', 'name', 'emoji'],
		validate: (state: FlowState) => {
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
		checkState: async (state: FlowState) => {
			// Add your state validation here
			return true;
		},
	};

	constructor(client: Client) {
		super(client);
		logger.debug({ flowId: this.id }, 'FlowName instance created');
	}

	/**
	 * Builds or updates the flow's message content.
	 * This method is called when:
	 * 1. The flow is first created (new message)
	 * 2. The message needs to be updated (existing message)
	 */
	async build(client: Client, state: FlowState): Promise<Message | void | BaseMessageOptions> {
		try {
			logger.debug({ flowId: this.id, state }, 'Building FlowName');
			const { interaction } = state || {};
			let messageOpts: BaseMessageOptions = {
				embeds: [],
				components: [],
			};

			// Build your message here
			switch (state.id) {
				case 'main-menu':
					messageOpts = await MainMenu.build(client, state);
					break;
				case 'category-select':
					// Category select message builder
					messageOpts = await CategorySelect.build(client, interaction?.guildId, state);
					break;
				case 'category-name-input':
					// Category name input modal builder
					break;
				case 'channel-select':
					// Channel select message builder
					break;
				case 'emoji-select':
					// Emoji select message builder
					break;
				case 'role-select':
					// Role select message builder
					break;
				case 'category-edit':
					// Category edit message builder
					break;
				case 'category-delete-confirmation':
					// Category delete confirmation modal builder
					break;
			}

			// Only create a new message if needed (no existing messageId)
			if (!this.messageId && interaction) {
				return this.createMessage(interaction, messageOpts);
			}

			// Otherwise just return the message options for BaseFlowHandler to update
			return messageOpts;
		} catch (error) {
			logger.error({ flowId: this.id, error }, 'Error building flow');
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

		const { action, category } = state.data || {};
		const { id, parent, group, data } = componentData || { id: '' };

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
						case 'emoji':
							return {
								to: 'emoji-select',
								data: {
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
				case 'delete-confirmation':
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
		logger.debug({ flowId: this.id, state }, 'Flow started');
	}

	/**
	 * Called when the flow ends
	 */
	public async onEnd(
		client: Client,
		state: FlowState,
		reason: 'completed' | 'cancelled' | 'timeout' | 'error'
	): Promise<void> {
		logger.debug({ flowId: this.id, state, reason }, 'Flow ended');
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
