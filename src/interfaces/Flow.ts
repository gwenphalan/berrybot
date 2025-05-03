import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Message,
	ModalSubmitInteraction,
	SelectMenuInteraction,
} from 'discord.js';
import { Client } from './Client';
import { logger } from '../util';

export interface FlowState {
	/** Unique identifier for this state (e.g., 'main-menu', 'settings') */
	id: string;
	/**
	 * Optional data associated with this state
	 * Can include things like:
	 * - Selected options
	 * - Form values
	 * - Interaction context
	 * - Sub-flow state
	 */
	data?: {
		[key: string]: any;
		subFlow?: {
			id: string; // ID of the sub-flow
			state: FlowState; // State of the sub-flow
			parent: string; // ID of the parent flow
		};
		subFlowResult?: any; // Result data from a completed sub-flow
	};
	/**
	 * ID of the previous state in the flow
	 * Used for navigation and maintaining flow history
	 */
	previous?: string;
	/**
	 * The Discord interaction that triggered this state
	 */
	interaction?:
		| ButtonInteraction
		| SelectMenuInteraction
		| ModalSubmitInteraction
		| ChatInputCommandInteraction;
}

export interface FlowStateSchema {
	/** Required fields in the state data */
	required?: string[];
	/** Optional fields in the state data */
	optional?: string[];
	/** Custom validation function */
	validate?: (state: FlowState) => boolean | string;
}

export interface FlowTransition {
	/** ID of the state to transition to */
	to: string;
	/** Optional data to pass to the next state */
	data?: Record<string, any>;
	/** Optional sub-flow to start */
	subFlow?: {
		id: string; // ID of the sub-flow to start
		initialState: FlowState; // Initial state for the sub-flow
	};
	/** Flag to indicate returning to parent flow */
	returnToParent?: boolean;
}

export interface FlowError extends Error {
	code: string;
	details?: Record<string, any>;
}

export interface FlowSecurityCheck {
	/** Check if the user has permission to interact with this flow */
	checkPermissions?(
		interaction:
			| ButtonInteraction
			| SelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction
	): Promise<boolean | string>;
	/** Check if the flow is in a valid state for this interaction */
	checkState?(state: FlowState): Promise<boolean | string>;
	/** Check if the interaction is valid for this flow */
	checkInteraction?(
		interaction:
			| ButtonInteraction
			| SelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction
	): Promise<boolean | string>;
}

export interface FlowHandler {
	/** Unique identifier for this handler (e.g., 'settings-flow') */
	id: string;

	/**
	 * Schema defining the required state structure
	 */
	stateSchema?: FlowStateSchema;

	/**
	 * Security checks for this flow
	 */
	security?: FlowSecurityCheck;

	/**
	 * Called when the flow is first initialized
	 * @param client - Discord client instance
	 * @param state - Initial flow state
	 */
	onStart?(client: Client, state: FlowState): Promise<void>;

	/**
	 * Called when the flow is ended (either completed or cancelled)
	 * @param client - Discord client instance
	 * @param state - Final flow state
	 * @param reason - Why the flow ended ('completed' | 'cancelled' | 'timeout' | 'error')
	 */
	onEnd?(
		client: Client,
		state: FlowState,
		reason: 'completed' | 'cancelled' | 'timeout' | 'error'
	): Promise<void>;

	/**
	 * Called when an error occurs in the flow
	 * @param client - Discord client instance
	 * @param state - Current flow state
	 * @param error - The error that occurred
	 */
	onError?(client: Client, state: FlowState, error: Error): Promise<void>;

	/**
	 * Called when the flow times out due to inactivity
	 * @param client - Discord client instance
	 * @param state - Current flow state
	 */
	onTimeout?(client: Client, state: FlowState): Promise<void>;

	build(client: Client, state: FlowState): Promise<any>;
	handle(
		interaction:
			| ButtonInteraction
			| SelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction,
		client: Client,
		state: FlowState,
		data?: { [key: string]: any }
	): Promise<FlowTransition | void>;
	getState(): FlowState;
	setState(state: FlowState): void;
	setMessageId(messageId: string): string | null;
}

export abstract class BaseFlowHandler implements FlowHandler {
	abstract id: string;
	protected state: FlowState;
	protected messageId: string | null = null;
	protected history: FlowState[] = [];
	protected client?: Client;
	protected timeoutId?: NodeJS.Timeout;
	protected readonly TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes
	protected readonly maxRetries = 3;
	protected retryCount = 0;
	protected readonly retryDelay = 1000; // 1 second

	// Lifecycle hooks
	public onStart?(client: Client, state: FlowState): Promise<void>;
	public onEnd?(
		client: Client,
		state: FlowState,
		reason: 'completed' | 'cancelled' | 'timeout' | 'error'
	): Promise<void>;
	public onError?(client: Client, state: FlowState, error: Error): Promise<void>;
	public onTimeout?(client: Client, state: FlowState): Promise<void>;

	/**
	 * Schema defining the required state structure
	 */
	public stateSchema?: FlowStateSchema;

	/**
	 * Security checks for this flow
	 */
	public security?: FlowSecurityCheck;

	constructor(client: Client) {
		this.client = client;
		this.state = { id: '' }; // Initialize with empty id, will be set by child class
		logger.debug('BaseFlowHandler instance created');
	}

	/**
	 * Start the flow lifecycle
	 */
	async start(client: Client, state: FlowState): Promise<void> {
		this.setState(state);
		this.resetTimeout(client);
		await this.onStart?.(client, state);
	}

	/**
	 * End the flow lifecycle
	 */
	async end(
		client: Client,
		reason: 'completed' | 'cancelled' | 'timeout' | 'error'
	): Promise<void> {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = undefined;
		}
		if (this.state) {
			await this.onEnd?.(client, this.state, reason);
		}
	}

	/**
	 * Handle an error in the flow
	 */
	async handleError(client: Client, error: Error): Promise<void> {
		logger.error(
			{
				flowId: this.id,
				error: error.message,
				stack: error.stack,
			},
			'Flow error occurred'
		);

		if (this.state) {
			await this.onError?.(client, this.state, error);
		}
	}

	/**
	 * Reset the flow timeout
	 */
	protected resetTimeout(client: Client): void {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}
		this.timeoutId = setTimeout(async () => {
			if (this.state) {
				await this.onTimeout?.(client, this.state);
				await this.end(client, 'timeout');
			}
		}, this.TIMEOUT_DURATION);
	}

	abstract build(client: Client, state: FlowState): Promise<any>;

	/**
	 * Creates a flow error with a code and details
	 */
	protected createError(code: string, message: string, details?: Record<string, any>): FlowError {
		const error = new Error(message) as FlowError;
		error.code = code;
		error.details = details;
		return error;
	}

	/**
	 * Performs security checks before handling an interaction
	 */
	protected async performSecurityChecks(
		interaction:
			| ButtonInteraction
			| SelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction,
		state: FlowState
	): Promise<void> {
		if (!this.security) return;

		const checks = [
			this.security.checkPermissions?.(interaction),
			this.security.checkState?.(state),
			this.security.checkInteraction?.(interaction),
		];

		const results = await Promise.all(checks.filter(Boolean));
		const errors = results.filter((result): result is string => typeof result === 'string');

		if (errors.length > 0) {
			throw this.createError('SECURITY_CHECK_FAILED', 'Security check failed', { errors });
		}
	}

	/**
	 * Retries an operation with exponential backoff
	 */
	protected async retry<T>(
		operation: () => Promise<T>,
		context: Record<string, any>
	): Promise<T> {
		try {
			return await operation();
		} catch (error) {
			if (this.retryCount >= this.maxRetries) {
				throw this.createError(
					'MAX_RETRIES_EXCEEDED',
					'Operation failed after maximum retries',
					{
						...context,
						error: error instanceof Error ? error.message : 'Unknown error',
					}
				);
			}

			this.retryCount++;
			const delay = Math.pow(2, this.retryCount) * this.retryDelay; // Exponential backoff
			await new Promise((resolve) => setTimeout(resolve, delay));

			return this.retry(operation, context);
		}
	}

	async handle(
		interaction:
			| ButtonInteraction
			| SelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction,
		client: Client,
		state: FlowState
	): Promise<FlowTransition | void> {
		try {
			// Reset retry count for new interaction
			this.retryCount = 0;

			// Perform security checks
			await this.performSecurityChecks(interaction, state);

			// Validate state
			this.validateState(state);

			// Handle the interaction with retry
			return await this.retry(() => this.handleInteraction(interaction, client, state), {
				interactionId: interaction.id,
				stateId: state.id,
			});
		} catch (error) {
			const flowError =
				error instanceof Error
					? this.createError('FLOW_ERROR', error.message, {
							stack: error.stack,
							interactionId: interaction.id,
							stateId: state.id,
						})
					: this.createError('UNKNOWN_ERROR', 'An unknown error occurred', {
							error,
							interactionId: interaction.id,
							stateId: state.id,
						});

			await this.handleError(client, flowError);
			throw flowError;
		}
	}

	/**
	 * Helper method to update an existing message
	 */
	protected async updateExistingMessage(client: Client, message: any): Promise<Message | void> {
		if (!this.messageId || !this.state?.interaction?.channelId) {
			logger.warn(
				{
					flowId: this.id,
					hasMessageId: !!this.messageId,
					hasChannelId: !!this.state?.interaction?.channelId,
				},
				'Cannot update message - missing messageId or channelId'
			);
			return;
		}

		const channel = client.channels.cache.get(this.state.interaction.channelId);
		if (!channel || !('messages' in channel)) {
			logger.warn(
				{
					flowId: this.id,
					channelId: this.state.interaction.channelId,
					channelFound: !!channel,
					hasMessages: channel ? 'messages' in channel : false,
				},
				'Cannot update message - invalid channel'
			);
			return;
		}

		logger.debug(
			{
				flowId: this.id,
				messageId: this.messageId,
			},
			'Updating existing message'
		);

		const flowMsg = (await (channel as any).messages.fetch(this.messageId)) as Message;
		return flowMsg.edit(message);
	}

	/**
	 * Helper method to create a new message via interaction
	 */
	protected async createNewMessage(
		interaction:
			| ButtonInteraction
			| SelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction,
		message: any
	): Promise<Message | void> {
		logger.debug(
			{
				flowId: this.id,
				interactionId: interaction.id,
			},
			'Creating new message via interaction'
		);

		const response = await interaction.reply(message);
		const reply = await interaction.fetchReply();
		this.setMessageId(reply.id);
		return reply;
	}

	/**
	 * Helper method to defer an interaction if possible
	 */
	protected async deferInteraction(
		interaction:
			| ButtonInteraction
			| SelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction
	): Promise<void> {
		if ('deferUpdate' in interaction) {
			await interaction.deferUpdate();
		}
	}

	getState(): FlowState {
		if (!this.state) {
			logger.error({ flowId: this.id }, 'Attempted to get state before it was set');
			throw new Error('State not set');
		}
		logger.debug({ flowId: this.id, state: this.state }, 'Retrieved flow state');
		return this.state;
	}

	setState(state: FlowState): void {
		this.validateState(state);
		this.state = state;
		if (this.messageId && this.client) {
			this.updateMessage(this.client);
			this.resetTimeout(this.client);
		}
	}

	setMessageId(messageId: string) {
		logger.debug(
			{
				flowId: this.id,
				previousMessageId: this.messageId,
				newMessageId: messageId,
			},
			'Setting message ID'
		);
		return (this.messageId = messageId);
	}

	async updateMessage(client: Client) {
		if (!this.messageId || !this.state) {
			logger.warn(
				{
					flowId: this.id,
					hasMessageId: !!this.messageId,
					hasState: !!this.state,
				},
				'Cannot update message - missing messageId or state'
			);
			return;
		}

		// Get the channel ID from the interaction
		const channelId = this.state.interaction?.channelId;
		if (!channelId) {
			logger.warn({ flowId: this.id }, 'Cannot update message - missing channel ID');
			return;
		}

		const channel = client.channels.cache.get(channelId);
		if (!channel || !('messages' in channel)) {
			logger.warn(
				{
					flowId: this.id,
					channelId,
					channelFound: !!channel,
					hasMessages: channel ? 'messages' in channel : false,
				},
				'Cannot update message - invalid channel'
			);
			return;
		}

		logger.debug(
			{
				flowId: this.id,
				messageId: this.messageId,
				channelId,
			},
			'Fetching message for update'
		);

		const message = await (channel as any).messages
			.fetch(this.messageId)
			.catch((error: Error) => {
				logger.error(
					{
						flowId: this.id,
						messageId: this.messageId,
						error: error.message,
					},
					'Failed to fetch message for update'
				);
				return null;
			});

		if (message) {
			logger.debug(
				{
					flowId: this.id,
					messageId: this.messageId,
				},
				'Building new message content'
			);

			const content = await this.build(client, this.state);

			logger.debug(
				{
					flowId: this.id,
					messageId: this.messageId,
				},
				'Updating message with new content'
			);

			// Edit the message with only the necessary fields
			await message.edit({
				embeds: content.embeds,
				components: content.components,
			});

			logger.debug(
				{
					flowId: this.id,
					messageId: this.messageId,
				},
				'Message update completed'
			);
		}
	}

	/**
	 * Validates the flow state against the schema
	 * @throws Error if validation fails
	 */
	protected validateState(state: FlowState): void {
		if (!this.stateSchema) return;

		const { required, optional, validate } = this.stateSchema;
		const data = state.data || {};

		// Check required fields
		if (required) {
			const missing = required.filter((field) => !(field in data));
			if (missing.length > 0) {
				throw new Error(`Missing required fields: ${missing.join(', ')}`);
			}
		}

		// Check for unknown fields
		const knownFields = new Set([...(required || []), ...(optional || [])]);
		const unknownFields = Object.keys(data).filter((field) => !knownFields.has(field));
		if (unknownFields.length > 0) {
			throw new Error(`Unknown fields: ${unknownFields.join(', ')}`);
		}

		// Run custom validation
		if (validate) {
			const result = validate(state);
			if (typeof result === 'string') {
				throw new Error(result);
			} else if (!result) {
				throw new Error('Custom validation failed');
			}
		}
	}

	/**
	 * Handle the actual interaction logic
	 * This should be implemented by the flow class
	 */
	protected abstract handleInteraction(
		interaction:
			| ButtonInteraction
			| SelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction,
		client: Client,
		state: FlowState
	): Promise<FlowTransition | void>;

	/**
	 * Start a sub-flow
	 * @param client - Discord client instance
	 * @param subFlowId - ID of the sub-flow to start
	 * @param initialState - Initial state for the sub-flow
	 */
	protected async startSubFlow(
		client: Client,
		subFlowId: string,
		initialState: FlowState
	): Promise<void> {
		logger.debug(
			{
				flowId: this.id,
				subFlowId,
				initialState,
			},
			'Starting sub-flow'
		);

		const currentState = this.getState();
		this.setState({
			...currentState,
			data: {
				...currentState.data,
				subFlow: {
					id: subFlowId,
					state: initialState,
					parent: currentState.id,
				},
			},
		});
	}

	/**
	 * End a sub-flow and return to parent
	 * @param client - Discord client instance
	 * @param finalState - Final state of the sub-flow
	 */
	protected async endSubFlow(client: Client, finalState: FlowState): Promise<void> {
		const currentState = this.getState();
		if (!currentState.data?.subFlow?.parent) {
			logger.warn(
				{
					flowId: this.id,
				},
				'Attempted to end sub-flow without parent'
			);
			return;
		}

		logger.debug(
			{
				flowId: this.id,
				parentId: currentState.data.subFlow.parent,
				finalState,
			},
			'Ending sub-flow'
		);

		// Return to parent flow with the sub-flow's final state
		this.setState({
			id: currentState.data.subFlow.parent,
			data: {
				...currentState.data,
				subFlowResult: finalState.data,
			},
		});
	}

	/**
	 * Handle a transition, including sub-flow transitions
	 */
	protected async handleTransition(client: Client, transition: FlowTransition): Promise<void> {
		if (transition.subFlow) {
			await this.startSubFlow(client, transition.subFlow.id, transition.subFlow.initialState);
		} else if (transition.returnToParent) {
			await this.endSubFlow(client, this.getState());
		} else {
			this.setState({
				id: transition.to,
				data: transition.data,
			});
		}
	}
}
