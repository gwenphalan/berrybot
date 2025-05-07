import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Collection,
	ModalSubmitInteraction,
	SelectMenuInteraction,
} from 'discord.js';
import { FlowHandler, FlowState } from '@/core/interfaces/Flow';
import { logger } from '@/core/logging/Logger';
import type { Client } from '@/core/client/BerryClient';

export interface FlowManagerInt {
	/**
	 * Get the current state for a user
	 * @param messageId - Discord user ID
	 * @returns Current flow state or null if not in a flow
	 */
	getState(messageId: string): Promise<FlowState | null>;

	/**
	 * Set the current state for a user
	 * @param messageId - Discord user ID
	 * @param state - New flow state
	 */
	setState(messageId: string, state: FlowState): Promise<void>;

	/**
	 * Clear the flow state for a user
	 * @param messageId - Discord user ID
	 */
	clearState(messageId: string): Promise<void>;
	/**
	 * Register a flow handler
	 * @param messageId - Message ID to register the handler for
	 * @param handler - Flow handler implementation
	 */

	registerHandler(messageId: string, handler: FlowHandler): void;

	/**
	 * Get a registered handler
	 * @param messageId - Handler messageId ID
	 * @returns Handler implementation or undefined if not found
	 */
	getHandler<T extends FlowHandler = FlowHandler>(messageId: string): T | undefined;

	/**
	 * Start a new flow
	 * @param interaction - The interaction that triggered the flow
	 * @param handler - Flow handler to use
	 * @param initialState - Initial state for the flow
	 */
	startFlow(
		interaction:
			| ButtonInteraction
			| SelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction,
		handler: FlowHandler,
		initialState: FlowState
	): Promise<void>;

	/**
	 * End a flow
	 * @param messageId - Message ID of the flow to end
	 * @param reason - Why the flow is ending
	 */
	endFlow(
		messageId: string,
		reason: 'completed' | 'cancelled' | 'timeout' | 'error'
	): Promise<void>;
}

export class FlowManager implements FlowManagerInt {
	private handlers = new Collection<string, FlowHandler>();
	private client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	getHandler<T extends FlowHandler = FlowHandler>(messageId: string): T | undefined {
		return this.handlers.get(messageId) as T | undefined;
	}

	async getState(messageId: string): Promise<FlowState | null> {
		const handler = this.getHandler(messageId);
		if (handler && typeof handler.getState === 'function') {
			return handler.getState();
		}
		return null;
	}

	async setState(messageId: string, state: FlowState): Promise<void> {
		const handler = this.getHandler(messageId);
		if (handler && typeof handler.setState === 'function') {
			await handler.setState(state);
		}
	}

	async clearState(messageId: string): Promise<void> {
		logger.debug({ messageId }, 'Clearing flow handler');
		const handler = this.getHandler(messageId);
		if (handler) {
			await this.endFlow(messageId, 'cancelled');
		}
		this.handlers.delete(messageId);
	}

	registerHandler(messageId: string, handler: FlowHandler): void {
		this.handlers.set(messageId, handler);
	}

	async startFlow(
		interaction:
			| ButtonInteraction
			| SelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction,
		handler: FlowHandler,
		initialState: FlowState
	): Promise<void> {
		logger.debug(
			{
				flowId: handler.id,
				initialState,
			},
			'Starting new flow'
		);

		// Start the flow first, which generates sessionId
		await (handler as any).start(this.client, {
			...initialState,
			interaction,
		});

		// Now build the initial message with the updated state (with sessionId)
		const stateWithSession = handler.getState();
		let message;
		try {
			message = await handler.build(this.client, stateWithSession);
		} catch (err) {
			logger.error(
				{
					flowId: handler.id,
					state: stateWithSession,
					error: err instanceof Error ? err.message : err,
					stack: err instanceof Error ? err.stack : undefined,
				},
				'Error building flow message'
			);
			throw new Error(
				'Failed to build initial flow message: ' +
					(err instanceof Error ? err.message : err)
			);
		}

		const isEphemeral = stateWithSession.ephemeral || handler.ephemeral;
		if (!message && !isEphemeral) {
			logger.error(
				{
					flowId: handler.id,
					state: stateWithSession,
					message,
					isEphemeral,
				},
				'Failed to build initial flow message (non-ephemeral)'
			);
			throw new Error('Failed to build initial flow message');
		} else if (!message && isEphemeral) {
			logger.debug(
				{
					flowId: handler.id,
					state: stateWithSession,
					message,
					isEphemeral,
				},
				'No message object returned for ephemeral flow, this is expected.'
			);
		}

		// Register handler with the sessionId
		if (!stateWithSession.sessionId) {
			throw new Error('Flow state missing sessionId after start');
		}
		this.registerHandler(stateWithSession.sessionId, handler);
	}

	async endFlow(
		messageId: string,
		reason: 'completed' | 'cancelled' | 'timeout' | 'error'
	): Promise<void> {
		const handler = this.getHandler(messageId);
		if (handler) {
			logger.debug(
				{
					messageId,
					flowId: handler.id,
					reason,
				},
				'Ending flow'
			);

			await (handler as any).end(this.client, reason);
			this.handlers.delete(messageId);
		}
	}

	async handleInteraction(
		interaction:
			| ButtonInteraction
			| SelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction
	): Promise<void> {
		// Get message ID from interaction
		const messageId =
			'message' in interaction && interaction.message ? interaction.message.id : null;
		if (!messageId) {
			logger.warn(
				{
					interactionId: interaction.id,
					interactionType: interaction.type,
				},
				'Interaction has no message ID'
			);
			return;
		}

		const handler = this.getHandler(messageId);

		if (!handler) {
			logger.warn(
				{
					messageId,
					interactionId: interaction.id,
					interactionType: interaction.type,
				},
				'No handler found for interaction'
			);
			return;
		}

		try {
			const state = await this.getState(messageId);
			if (!state) {
				logger.warn(
					{
						messageId,
						flowId: handler.id,
					},
					'No state found for handler'
				);
				return;
			}

			const transition = await handler.handle(interaction, this.client, state);

			if (transition?.to === 'end') {
				await this.endFlow(messageId, 'completed');
			}
		} catch (error) {
			logger.error(
				{
					messageId,
					flowId: handler.id,
					error: error instanceof Error ? error.message : 'Unknown error',
					stack: error instanceof Error ? error.stack : undefined,
				},
				'Error handling flow interaction'
			);

			await (handler as any).handleError(
				this.client,
				error instanceof Error ? error : new Error('Unknown error')
			);
			await this.endFlow(messageId, 'error');
		}
	}
}
