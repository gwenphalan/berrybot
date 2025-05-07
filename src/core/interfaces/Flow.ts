import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Message,
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
} from 'discord.js';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import { parseData } from '@/events/interactions/MessageComponent';

export interface FlowState {
	/** Unique identifier for this state (e.g., 'main-menu', 'settings') */
	id: string;
	/**
	 * The session ID for this flow instance (used for component routing)
	 */
	sessionId?: string;
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
		| StringSelectMenuInteraction
		| ModalSubmitInteraction
		| ChatInputCommandInteraction;
	/**
	 * Whether this flow's messages should be ephemeral
	 */
	ephemeral?: boolean;
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
	/** The interaction that triggered the transition */
	interaction?:
		| ButtonInteraction
		| StringSelectMenuInteraction
		| ModalSubmitInteraction
		| ChatInputCommandInteraction;
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
			| StringSelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction
	): Promise<boolean | string>;
	/** Check if the flow is in a valid state for this interaction */
	checkState?(state: FlowState): Promise<boolean | string>;
	/** Check if the interaction is valid for this flow */
	checkInteraction?(
		interaction:
			| ButtonInteraction
			| StringSelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction
	): Promise<boolean | string>;
}

export interface FlowHandler {
	/** Unique identifier for this handler (e.g., 'settings-flow') */
	id: string;

	/**
	 * Whether this flow should be persisted to the database
	 */
	persistent?: boolean;

	/**
	 * Whether this flow's messages should be ephemeral
	 */
	ephemeral?: boolean;

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
			| StringSelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction,
		client: Client,
		data?: { [key: string]: any }
	): Promise<FlowTransition | void>;
	getState(): FlowState;
	setState(state: FlowState): void;
	setMessageId(messageId: string): string | null;
	persistFlow?(client: Client): Promise<void>;
	unpersistFlow?(client: Client): Promise<void>;
}

export abstract class BaseFlowHandler implements FlowHandler {
	abstract id: string;
	protected state: FlowState;
	protected messageId: string | null = null;
	protected sessionId: string | null = null;
	protected history: FlowState[] = [];
	protected client?: Client;
	protected timeoutId?: NodeJS.Timeout;
	protected readonly TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes
	protected readonly maxRetries = 3;
	protected retryCount = 0;
	protected readonly retryDelay = 1000; // 1 second
	protected updateTimeout?: NodeJS.Timeout; // Add debounce timeout
	protected updateInProgress: boolean = false; // Flag to prevent multiple concurrent updates
	public persistent?: boolean = false; // Whether this flow should be persisted
	public ephemeral?: boolean = false; // Whether this flow's messages should be ephemeral

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
		logger.debug({ state }, '[BaseFlowHandler.start] state at start');
		if (!state.interaction) {
			if (this.state?.interaction) {
				logger.warn(
					'[BaseFlowHandler.start] No interaction in state, using previous interaction'
				);
				state.interaction = this.state.interaction;
			} else {
				logger.error(
					{ state },
					'[BaseFlowHandler.start] No interaction provided to flow start'
				);
				throw new Error('No interaction provided to flow start');
			}
		}
		// Generate a sessionId if not present
		if (!state.sessionId) {
			// Use nanoid or uuid here; for now, use a simple random string
			state.sessionId = Math.random().toString(36).slice(2, 10) + Date.now();
		}
		this.sessionId = state.sessionId;
		// Add initial state to history
		this.history.push({ ...state });
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
		// Unpersist flow when it ends
		if (this.persistent) {
			await this.unpersistFlow(client);
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
			| StringSelectMenuInteraction
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
			| StringSelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction,
		client: Client,
		_data?: { [key: string]: any }
	): Promise<FlowTransition | void> {
		try {
			// Reset retry count for new interaction
			this.retryCount = 0;
			logger.debug(
				{
					flowId: this.id,
					interactionId: interaction.id,
					stateId: this.state?.id,
				},
				'handle() called'
			);

			// Defer the interaction update first
			await this.deferInteraction(interaction);

			// Parse the custom ID to get component data
			const componentData =
				'customId' in interaction && interaction.customId
					? parseData(interaction.customId)
					: undefined;

			// Perform security checks
			await this.performSecurityChecks(interaction, this.state);

			// Validate state
			this.validateState(this.state);

			// Handle the interaction with retry, passing the parsed component data
			logger.debug(
				{
					flowId: this.id,
					interactionId: interaction.id,
				},
				'Calling handleInteraction'
			);

			const transition = await this.retry(
				() => this.handleInteraction(interaction, client, this.state, componentData),
				{
					interactionId: interaction.id,
					stateId: this.state.id,
				}
			);

			// Process the transition if one was returned
			if (transition) {
				logger.debug(
					{
						flowId: this.id,
						interactionId: interaction.id,
						transition: { to: transition.to, hasData: !!transition.data },
					},
					'Got transition, preparing to update state'
				);

				if (transition.to === 'end') {
					await this.end(client, 'completed');
				} else {
					// Update state with the transition data
					const newState = {
						id: transition.to,
						data: transition.data,
						previous: this.state.id,
						interaction: transition.interaction ?? interaction,
					};
					logger.debug(
						{
							flowId: this.id,
							interactionId: interaction.id,
							fromState: this.state.id,
							toState: newState.id,
						},
						'Calling setState() from handle()'
					);

					this.setState(newState);
				}
			} else {
				logger.debug(
					{
						flowId: this.id,
						interactionId: interaction.id,
					},
					'No transition returned from handleInteraction'
				);
			}

			return transition;
		} catch (error) {
			const flowError =
				error instanceof Error
					? this.createError('FLOW_ERROR', error.message, {
							stack: error.stack,
							interactionId: interaction.id,
							stateId: this.state.id,
							originalStack: (error as any).stack,
						})
					: this.createError('UNKNOWN_ERROR', 'An unknown error occurred', {
							error,
							interactionId: interaction.id,
							stateId: this.state.id,
						});

			logger.error(
				{ flowId: this.id, error: flowError, stack: flowError.stack },
				'Flow error occurred (with stack)'
			);
			await this.handleError(client, flowError);
			throw flowError;
		}
	}

	/**
	 * Helper method to update an existing message
	 * Handles ephemeral and non-ephemeral messages correctly.
	 */
	protected async updateMessage(client: Client, message: any): Promise<Message | void> {
		logger.debug(
			{
				flowId: this.id,
				messageId: this.messageId,
				caller: new Error().stack?.split('\n')[2], // Log the caller of updateMessage
			},
			'updateMessage() called'
		);

		// If the message is ephemeral, use interaction.editReply()
		const isEphemeral = this.ephemeral || this.state?.ephemeral;
		const interaction = this.state?.interaction;
		if (isEphemeral && interaction && 'editReply' in interaction) {
			try {
				// Only possible within the interaction token window (15 min)
				await interaction.editReply(message);
				return undefined; // Ephemeral replies are not Message objects
			} catch (error) {
				logger.warn(
					{
						flowId: this.id,
						messageId: this.messageId,
						error: error instanceof Error ? error.message : error,
					},
					'Failed to edit ephemeral reply (possibly expired token)'
				);
				return undefined;
			}
		}

		// Non-ephemeral: edit the message in the channel
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

		const flowMsg = await (channel as any).messages.fetch(this.messageId);

		try {
			// Try to edit the message first
			return await flowMsg.edit(message);
		} catch (error: any) {
			// If we get a sticker error, create a new message and delete the old one
			if (error.code === 50080) {
				logger.debug(
					{
						flowId: this.id,
						messageId: this.messageId,
					},
					'Message contains stickers, creating new message'
				);

				// Create new message
				const newMessage = await (channel as any).send(message);

				// Delete old message
				await flowMsg.delete().catch((err: Error) => {
					logger.warn(
						{
							flowId: this.id,
							messageId: this.messageId,
							error: err.message,
						},
						'Failed to delete old message'
					);
				});

				// Update message ID
				this.setMessageId(newMessage.id);
				return newMessage;
			}
			throw error;
		}
	}

	/**
	 * Helper method to create a new message via interaction
	 * Handles ephemeral and non-ephemeral messages correctly.
	 */
	protected async createMessage(
		interaction:
			| ButtonInteraction
			| StringSelectMenuInteraction
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

		const ephemeral = this.ephemeral || this.state.ephemeral;
		await interaction.reply({ ...message, ephemeral });
		if (ephemeral) {
			// For ephemeral, fetchReply returns an APIMessage, not a Message, and cannot be edited by ID later
			return undefined;
		}
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
			| StringSelectMenuInteraction
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
		logger.debug(
			{
				flowId: this.id,
				stateId: this.state.id,
				hasInteraction: !!this.state.interaction,
				interactionType: this.state.interaction?.constructor?.name,
			},
			'[getState] Retrieved flow state'
		);
		return this.state;
	}

	setState(state: FlowState): void {
		logger.debug(
			{
				stateId: state.id,
				hasInteraction: !!state.interaction,
				interactionType: state.interaction?.constructor?.name,
			},
			'[setState] state at setState'
		);
		logger.debug(
			{
				flowId: this.id,
				currentState: this.state?.id,
				newState: state.id,
				currentHasInteraction: !!this.state?.interaction,
				newHasInteraction: !!state.interaction,
			},
			'[setState] setState() called'
		);

		this.validateState(state);

		// Only update if the state actually changed
		if (this.statesAreEqual(this.state, state)) {
			logger.debug(
				{
					flowId: this.id,
					stateId: state.id,
				},
				'setState() - states are equal, skipping update'
			);
			return;
		}

		// Add current state to history before updating
		if (this.state) {
			this.history.push({ ...this.state });
		}
		this.state = state;
		this.sessionId = state.sessionId || this.sessionId;

		// Only update message if we have a messageId and the state changed
		if (this.messageId && this.client) {
			const client = this.client;

			// Clear any pending update
			if (this.updateTimeout) {
				clearTimeout(this.updateTimeout);
			}

			// Don't schedule update if one is already in progress
			if (this.updateInProgress) {
				logger.debug(
					{ flowId: this.id },
					'Skipping update - another update is already in progress'
				);
				return;
			}

			// Debounce the update to prevent multiple rapid updates
			this.updateTimeout = setTimeout(() => {
				// Set flag to prevent concurrent updates
				this.updateInProgress = true;

				logger.debug(
					{
						flowId: this.id,
						stateId: state.id,
					},
					'About to call build() from setState()'
				);

				// Pass sessionId to message builder
				this.build(client, { ...state, sessionId: this.sessionId ?? undefined })
					.then((content) => {
						if (content) {
							return this.updateMessage(client, content);
						}
						return null;
					})
					.finally(() => {
						// Reset flag when update is complete
						this.updateInProgress = false;
					});
			}, 100); // 100ms debounce

			this.resetTimeout(client);

			// Persist state changes if flow is persistent
			if (this.persistent) {
				this.persistFlow(client).catch((error) => {
					logger.error(
						{
							flowId: this.id,
							messageId: this.messageId,
							error: error instanceof Error ? error.message : 'Unknown error',
						},
						'Failed to persist flow state after update'
					);
				});
			}
		}
	}

	/**
	 * Compare two flow states, handling BigInt values
	 */
	private statesAreEqual(state1: FlowState | undefined, state2: FlowState): boolean {
		if (!state1) return false;

		// Compare basic properties
		if (state1.id !== state2.id) return false;
		if (state1.previous !== state2.previous) return false;

		// Compare interaction presence and ID
		const i1 = state1.interaction as any;
		const i2 = state2.interaction as any;
		if (!!i1 !== !!i2) return false;
		if (i1 && i2 && i1.id !== i2.id) return false;

		// Compare data objects
		const data1 = state1.data || {};
		const data2 = state2.data || {};

		// Compare data keys
		const keys1 = Object.keys(data1);
		const keys2 = Object.keys(data2);
		if (keys1.length !== keys2.length) return false;

		// Compare each data value
		for (const key of keys1) {
			if (!(key in data2)) return false;

			const val1 = data1[key];
			const val2 = data2[key];

			// Handle BigInt values
			if (typeof val1 === 'bigint' && typeof val2 === 'bigint') {
				if (val1 !== val2) return false;
			} else if (typeof val1 !== typeof val2) {
				return false;
			} else if (typeof val1 === 'object' && val1 !== null) {
				// Recursively compare objects
				if (!this.statesAreEqual(val1 as FlowState, val2 as FlowState)) {
					return false;
				}
			} else if (val1 !== val2) {
				return false;
			}
		}

		return true;
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
	protected async handleTransition(
		client: Client,
		transition: FlowTransition,
		interaction:
			| ButtonInteraction
			| StringSelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction
	): Promise<void> {
		if (transition.subFlow) {
			await this.startSubFlow(client, transition.subFlow.id, transition.subFlow.initialState);
		} else if (transition.returnToParent) {
			await this.endSubFlow(client, this.getState());
		} else {
			// Only update state if it's actually changing
			const newState = {
				id: transition.to,
				data: transition.data,
				previous: this.state.id,
				interaction,
			};

			// Check if the state is actually changing
			if (!this.statesAreEqual(this.state, newState)) {
				this.setState(newState);
			}
		}
	}

	/**
	 * Persist the flow state to the database
	 */
	async persistFlow(client: Client): Promise<void> {
		if (!this.persistent || !this.messageId) {
			return;
		}

		try {
			const state = this.getState();
			await client.database.flows.model.findOneAndUpdate(
				{ messageId: this.messageId },
				{
					messageId: this.messageId,
					flowType: this.id.toUpperCase(),
					currentState: state,
					expiresAt: new Date(Date.now() + this.TIMEOUT_DURATION),
				},
				{ upsert: true }
			);
			logger.debug({ flowId: this.id, messageId: this.messageId }, 'Flow state persisted');
		} catch (error) {
			logger.error(
				{
					flowId: this.id,
					messageId: this.messageId,
					error: error instanceof Error ? error.message : 'Unknown error',
				},
				'Failed to persist flow state'
			);
		}
	}

	/**
	 * Remove the flow state from the database
	 */
	async unpersistFlow(client: Client): Promise<void> {
		if (!this.persistent || !this.messageId) {
			return;
		}

		try {
			await client.database.flows.model.deleteOne({ messageId: this.messageId });
			logger.debug(
				{ flowId: this.id, messageId: this.messageId },
				'Flow state removed from database'
			);
		} catch (error) {
			logger.error(
				{
					flowId: this.id,
					messageId: this.messageId,
					error: error instanceof Error ? error.message : 'Unknown error',
				},
				'Failed to remove flow state from database'
			);
		}
	}
}
