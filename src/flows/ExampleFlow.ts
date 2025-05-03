import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Message,
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
	PermissionsBitField,
} from 'discord.js';
import { BaseFlowHandler, FlowHandler, FlowState, FlowTransition } from '../interfaces/Flow';
import { Client } from '@/interfaces';
import { CounterMessage } from '../messages/counter';
import { logger } from '../util';

/**
 * ExampleFlow demonstrates a simple counter flow with a button interaction.
 * It extends BaseFlowHandler to inherit common flow functionality.
 */
export class ExampleFlow extends BaseFlowHandler {
	// Unique identifier for this flow type
	id = 'example-flow';

	// Initial state of the flow with a counter starting at 0
	state: FlowState = {
		id: 'example-flow',
		data: {
			counter: 0,
		},
	};

	// Define the state schema
	stateSchema = {
		required: ['count'],
		optional: ['lastUpdated'],
		validate: (state: FlowState) => {
			if (state.data?.count < 0) {
				return 'Count cannot be negative';
			}
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
			// Example: Only allow users with SendMessages permission
			const permissions = interaction.member?.permissions;
			if (
				!permissions ||
				!(permissions instanceof PermissionsBitField) ||
				!permissions.has(PermissionsBitField.Flags.SendMessages)
			) {
				return 'You need the Send Messages permission to use this flow';
			}
			return true;
		},
		checkState: async (state: FlowState) => {
			// Example: Check if count is within reasonable bounds
			if (state.data?.count > 1000) {
				return 'Count cannot exceed 1000';
			}
			return true;
		},
	};

	constructor(client: Client) {
		super(client);
		logger.debug({ flowId: this.id }, 'ExampleFlow instance created');
	}

	/**
	 * Builds or updates the flow's message content.
	 * This method is called when:
	 * 1. The flow is first created (new message)
	 * 2. The message needs to be updated (existing message)
	 *
	 * @param client - The Discord client instance
	 * @param state - Current state of the flow
	 * @returns Promise resolving to the message or void if build fails
	 */
	async build(client: Client, state: FlowState): Promise<Message | void> {
		logger.debug({ flowId: this.id, state }, 'Building ExampleFlow');
		const { interaction } = state || {};

		// Flow Logic
		const message = await CounterMessage.build(client, state);

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
		const newCount = (state.data?.count || 0) + 1;

		// Update the flow's state with the new count and preserve the interaction
		this.setState({
			id: 'example-flow',
			data: {
				count: newCount,
				lastUpdated: new Date().toISOString(),
			},
			interaction: interaction,
		});

		// Define the transition to maintain the flow
		const transition: FlowTransition = {
			to: 'example-flow',
			data: {
				count: newCount,
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
