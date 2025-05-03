import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Message,
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
	PermissionsBitField,
} from 'discord.js';
import { BaseFlowHandler, FlowState, FlowTransition } from '../interfaces/Flow';
import { Client } from '../interfaces/Client';
import { logger } from '../util/Logger';

/**
 * FlowName - Flow Description
 * Handles flow functionality description
 */
export class FlowName extends BaseFlowHandler {
	// Unique identifier for this flow type
	id = 'flow-id';

	// Initial state of the flow
	state: FlowState = {
		id: 'flow-id',
		data: {
			initialState,
		},
	};

	// Define the state schema
	stateSchema = {
		required: ['requiredField'],
		optional: ['optionalField'],
		validate: (state: FlowState) => {
			// Add your validation logic here
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
			return true;
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
	async build(client: Client, state: FlowState): Promise<Message | void> {
		logger.debug({ flowId: this.id, state }, 'Building FlowName');
		const { interaction } = state || {};

		// Build your message here
		const message = await MessageTemplate.build(client, state);

		// Handle updating an existing message
		if (this.messageId && interaction?.channelId) {
			return this.updateExistingMessage(client, message);
		}
		// Handle creating a new message via interaction
		else if (interaction) {
			return this.createNewMessage(interaction, message);
		}

		logger.error({ flowId: this.id }, 'No valid message target found for build');
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
		state: FlowState
	): Promise<FlowTransition | void> {
		// Add your interaction handling logic here

		// Update the flow's state
		this.setState({
			id: 'flow-id',
			data: {
				updatedState,
			},
			interaction: interaction,
		});

		// Define the transition
		const transition: FlowTransition = {
			to: 'flow-id',
			data: {
				transitionData,
			},
		};

		return transition;
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
