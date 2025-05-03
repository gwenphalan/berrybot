# Creating New Flows in BerryBot

## Table of Contents

- [Creating New Flows in BerryBot](#creating-new-flows-in-berrybot)
    - [Table of Contents](#table-of-contents)
    - [Overview](#overview)
    - [Flow Architecture](#flow-architecture)
        - [Core Components](#core-components)
        - [Key Concepts](#key-concepts)
    - [Creating a New Flow](#creating-a-new-flow)
        - [1. Basic Structure](#1-basic-structure)
        - [2. State Management](#2-state-management)
        - [3. Message Building](#3-message-building)
        - [4. Interaction Handling](#4-interaction-handling)
        - [5. Sub-flow Integration](#5-sub-flow-integration)
    - [Best Practices](#best-practices)
    - [Example Implementation](#example-implementation)
        - [1. Simple Counter Flow](#1-simple-counter-flow)
        - [2. Settings Flow with Sub-flows](#2-settings-flow-with-sub-flows)
    - [Troubleshooting](#troubleshooting)
        - [Common Issues](#common-issues)
    - [Additional Resources](#additional-resources)
    - [Advanced Features](#advanced-features)
        - [1. Retry Mechanism](#1-retry-mechanism)
        - [2. Error Handling Patterns](#2-error-handling-patterns)
        - [3. History Tracking](#3-history-tracking)
        - [4. Sub-flow Usage](#4-sub-flow-usage)
        - [5. Logging System](#5-logging-system)
    - [Flow Usage Examples](#flow-usage-examples)
        - [1. Command Implementation](#1-command-implementation)
        - [2. Message Builder (Template)](#2-message-builder-template)
        - [3. Message Component (Button)](#3-message-component-button)
        - [4. Integration Flow](#4-integration-flow)

## Overview

Flows in BerryBot are a powerful way to create interactive, stateful conversations with users. They allow you to build complex interactions that maintain state, handle user input, and manage transitions between different states of the conversation.

## Flow Architecture

### Core Components

1. **FlowHandler**: The base interface that all flows must implement
2. **FlowState**: Represents the current state of a flow
3. **FlowManager**: Manages flow lifecycle and state transitions
4. **BaseFlowHandler**: Abstract class providing common flow functionality

### Key Concepts

- **State Management**: Each flow maintains its own state
- **Security Checks**: Built-in permission and state validation
- **Sub-flows**: Support for nested flows and complex interactions
- **Timeout Handling**: Automatic cleanup of inactive flows
- **Error Handling**: Robust error management and recovery
- **Message Updates**: Automatic message updates when state changes

## Creating a New Flow

### 1. Basic Structure

Create a new file in `/src/flows/` with the following structure:

```typescript
import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Message,
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
} from 'discord.js';
import { BaseFlowHandler, FlowState, FlowTransition } from '../interfaces/Flow';
import { Client } from '../interfaces/Client';
import { logger } from '../util';

export class MyNewFlow extends BaseFlowHandler {
	// Unique identifier for this flow
	id = 'my-new-flow';

	// Define the initial state
	state: FlowState = {
		id: 'my-new-flow',
		data: {
			// Your initial state data here
		},
	};

	// Optional: Define state schema for validation
	stateSchema = {
		required: ['field1', 'field2'],
		optional: ['field3'],
		validate: (state: FlowState) => {
			// Custom validation logic
			return true;
		},
	};

	// Optional: Define security checks
	security = {
		checkPermissions: async (interaction) => {
			// Check user permissions
			return true;
		},
		checkState: async (state) => {
			// Validate state
			return true;
		},
	};

	// Required: Build the message for this flow
	async build(client: Client, state: FlowState): Promise<Message | void> {
		// Build your message here
		return {
			embeds: [
				/* your embeds */
			],
			components: [
				/* your components */
			],
		};
	}

	// Required: Handle interactions
	protected async handleInteraction(
		interaction:
			| ButtonInteraction
			| StringSelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction,
		client: Client,
		state: FlowState
	): Promise<FlowTransition | void> {
		// Handle the interaction
	}
}
```

### 2. State Management

The flow state should contain all necessary data for the flow to function:

```typescript
state: FlowState = {
	id: 'my-new-flow',
	data: {
		// Required fields
		field1: 'value1',
		field2: 'value2',

		// Optional fields
		field3: 'value3',

		// Sub-flow data (if needed)
		subFlow: {
			id: 'sub-flow-id',
			state: {
				/* sub-flow state */
			},
			parent: 'my-new-flow',
		},
	},
};
```

### 3. Message Building

The `build` method should create the message that users will see. The `BaseFlowHandler` class provides two helper methods that handle message creation and updates:

- `updateExistingMessage(client: Client, message: any)`: Updates an existing message
- `createNewMessage(interaction: Interaction, message: any)`: Creates a new message via interaction

Here's how to use these inherited methods:

```typescript
async build(client: Client, state: FlowState): Promise<Message | void> {
    const message = {
        embeds: [
            {
                title: 'My Flow',
                description: 'Current state: ' + state.data.field1,
                fields: [
                    {
                        name: 'Field 2',
                        value: state.data.field2
                    }
                ]
            }
        ],
        components: [
            // Add your buttons, select menus, etc.
        ]
    };

    // The BaseFlowHandler provides these helper methods:
    if (this.messageId && state.interaction?.channelId) {
        // Updates an existing message if we have a messageId
        return this.updateExistingMessage(client, message);
    } else if (state.interaction) {
        // Creates a new message via the interaction
        return this.createNewMessage(state.interaction, message);
    }
}
```

These helper methods handle:

- Message creation and updates
- Setting the messageId
- Error handling for message operations
- Channel permission checks
- Message fetching and editing

You don't need to implement these methods yourself - they're inherited from `BaseFlowHandler`. Just focus on building your message content and using these helper methods to handle the Discord.js message operations.

### 4. Interaction Handling

Handle user interactions in the `handleInteraction` method:

```typescript
protected async handleInteraction(
    interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction | ChatInputCommandInteraction,
    client: Client,
    state: FlowState
): Promise<FlowTransition | void> {
    if (!('customId' in interaction)) return;

    switch (interaction.customId) {
        case 'button-1':
            // Update state
            this.setState({
                ...state,
                data: {
                    ...state.data,
                    field1: 'new value'
                }
            });
            break;

        case 'button-2':
            // Start sub-flow
            return {
                to: 'sub-flow',
                subFlow: {
                    id: 'sub-flow',
                    initialState: {
                        id: 'sub-flow',
                        data: { /* initial sub-flow data */ }
                    }
                }
            };
    }
}
```

### 5. Sub-flow Integration

To handle sub-flows:

```typescript
// Start a sub-flow
protected async startSubFlow(
    client: Client,
    subFlowId: string,
    initialState: FlowState
): Promise<void> {
    const currentState = this.getState();
    this.setState({
        ...currentState,
        data: {
            ...currentState.data,
            subFlow: {
                id: subFlowId,
                state: initialState,
                parent: currentState.id
            }
        }
    });
}

// Handle sub-flow completion
async onSubFlowEnd(subFlowId: string, result: any): Promise<void> {
    if (subFlowId === 'sub-flow') {
        this.setState({
            ...this.getState(),
            data: {
                ...this.getState().data,
                // Update with sub-flow result
            }
        });
    }
}
```

## Best Practices

1. **State Management**

    - Keep state data minimal and focused
    - Use TypeScript interfaces to define state structure
    - Validate state changes before applying them

2. **Error Handling**

    - Implement proper error handling in all async operations
    - Use the built-in retry mechanism for transient failures
    - Log errors with appropriate context

3. **Security**

    - Always implement permission checks
    - Validate user input
    - Sanitize data before storing in state

4. **Performance**

    - Minimize state updates
    - Use efficient message updates
    - Clean up resources when flow ends

5. **User Experience**
    - Provide clear feedback for user actions
    - Handle edge cases gracefully
    - Implement proper timeout handling

## Example Implementation

### 1. Simple Counter Flow

Here's a complete example of a simple counter flow:

```typescript
import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Message,
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
} from 'discord.js';
import { BaseFlowHandler, FlowState, FlowTransition } from '../interfaces/Flow';
import { Client } from '../interfaces/Client';
import { logger } from '../util';
import { CounterMessage } from '../messages/counter';

export class CounterFlow extends BaseFlowHandler {
	id = 'counter-flow';

	state: FlowState = {
		id: 'counter-flow',
		data: {
			count: 0,
			lastUpdated: new Date().toISOString(),
		},
	};

	stateSchema = {
		required: ['count', 'lastUpdated'],
		validate: (state: FlowState) => {
			if (typeof state.data?.count !== 'number') {
				return 'Count must be a number';
			}
			return true;
		},
	};

	async build(client: Client, state: FlowState): Promise<Message | void> {
		logger.debug({ state }, 'Building counter message');
		const message = await CounterMessage.build(client, state);

		if (this.messageId && state.interaction?.channelId) {
			return this.updateExistingMessage(client, message);
		} else if (state.interaction) {
			return this.createNewMessage(state.interaction, message);
		}
	}

	protected async handleInteraction(
		interaction:
			| ButtonInteraction
			| StringSelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction,
		client: Client,
		state: FlowState
	): Promise<FlowTransition | void> {
		if (!('customId' in interaction)) return;

		if (interaction.customId === 'increment') {
			this.setState({
				...state,
				data: {
					count: (state.data?.count || 0) + 1,
					lastUpdated: new Date().toISOString(),
				},
			});
		}
	}
}
```

### 2. Settings Flow with Sub-flows

Here's a more complex example of a settings flow that uses sub-flows and view-based message building:

```typescript
import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Message,
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
} from 'discord.js';
import { BaseFlowHandler, FlowState, FlowTransition } from '../interfaces/Flow';
import { Client } from '../interfaces/Client';
import { logger } from '../util';
import { SettingsHomeMessage } from '../messages/settings/home';
import { SettingsCategoryMessage } from '../messages/settings/category';
import { SettingsEditMessage } from '../messages/settings/edit';

export class SettingsFlow extends BaseFlowHandler {
	id = 'settings-flow';

	state: FlowState = {
		id: 'settings-flow',
		data: {
			view: 'home', // Current view: 'home', 'category', or 'setting'
			category: null, // Selected category
			setting: null, // Selected setting
			settings: {
				// Settings data
				notifications: {
					enabled: true,
					channels: ['general'],
				},
				moderation: {
					autoDelete: false,
					threshold: 3,
				},
			},
		},
	};

	stateSchema = {
		required: ['view', 'settings'],
		optional: ['category', 'setting'],
		validate: (state: FlowState) => {
			if (!['home', 'category', 'setting'].includes(state.data?.view)) {
				return 'Invalid view';
			}
			return true;
		},
	};

	async build(client: Client, state: FlowState): Promise<Message | void> {
		logger.debug({ state }, 'Building settings message');

		let message;
		switch (state.data?.view) {
			case 'home':
				message = await SettingsHomeMessage.build(client, state);
				break;
			case 'category':
				message = await SettingsCategoryMessage.build(client, state);
				break;
			case 'setting':
				message = await SettingsEditMessage.build(client, state);
				break;
			default:
				throw this.createError('INVALID_VIEW', 'Invalid view specified');
		}

		if (this.messageId && state.interaction?.channelId) {
			return this.updateExistingMessage(client, message);
		} else if (state.interaction) {
			return this.createNewMessage(state.interaction, message);
		}
	}

	protected async handleInteraction(
		interaction:
			| ButtonInteraction
			| StringSelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction,
		client: Client,
		state: FlowState
	): Promise<FlowTransition | void> {
		if (!('customId' in interaction)) return;

		switch (interaction.customId) {
			case 'back':
				// Handle navigation back
				if (state.data?.view === 'setting') {
					this.setState({
						...state,
						data: {
							...state.data,
							view: 'category',
							setting: null,
						},
					});
				} else if (state.data?.view === 'category') {
					this.setState({
						...state,
						data: {
							...state.data,
							view: 'home',
							category: null,
						},
					});
				}
				break;

			case 'category-select':
				// Handle category selection
				if ('values' in interaction) {
					const category = interaction.values[0];
					this.setState({
						...state,
						data: {
							...state.data,
							view: 'category',
							category,
						},
					});
				}
				break;

			case 'setting-edit':
				// Start sub-flow for editing a setting
				return {
					to: 'settings-flow',
					subFlow: {
						id: 'setting-edit-flow',
						initialState: {
							id: 'setting-edit-flow',
							data: {
								category: state.data?.category,
								setting: state.data?.setting,
								currentValue:
									state.data?.settings[state.data?.category][state.data?.setting],
							},
						},
					},
				};
		}
	}

	// Handle sub-flow completion
	public async onSubFlowEnd(subFlowId: string, result: any): Promise<void> {
		if (subFlowId === 'setting-edit-flow') {
			const { category, setting, value } = result;
			this.setState({
				...this.getState(),
				data: {
					...this.getState().data,
					settings: {
						...this.getState().data.settings,
						[category]: {
							...this.getState().data.settings[category],
							[setting]: value,
						},
					},
				},
			});
		}
	}
}

// Sub-flow for editing a setting
export class SettingEditFlow extends BaseFlowHandler {
	id = 'setting-edit-flow';

	state: FlowState = {
		id: 'setting-edit-flow',
		data: {
			category: null,
			setting: null,
			currentValue: null,
			newValue: null,
		},
	};

	async build(client: Client, state: FlowState): Promise<Message | void> {
		logger.debug({ state }, 'Building setting edit message');
		const message = await SettingsEditMessage.build(client, state);

		if (this.messageId && state.interaction?.channelId) {
			return this.updateExistingMessage(client, message);
		} else if (state.interaction) {
			return this.createNewMessage(state.interaction, message);
		}
	}

	protected async handleInteraction(
		interaction:
			| ButtonInteraction
			| StringSelectMenuInteraction
			| ModalSubmitInteraction
			| ChatInputCommandInteraction,
		client: Client,
		state: FlowState
	): Promise<FlowTransition | void> {
		if (!('customId' in interaction)) return;

		switch (interaction.customId) {
			case 'save':
				// Return to parent flow with updated value
				return {
					returnToParent: true,
					data: {
						category: state.data?.category,
						setting: state.data?.setting,
						value: state.data?.newValue,
					},
				};

			case 'cancel':
				// Return to parent flow without changes
				return {
					returnToParent: true,
				};
		}
	}
}
```

This settings flow example demonstrates:

1. View-based message building using separate message templates
2. Sub-flow integration for editing settings
3. State management with nested data
4. Navigation between different views
5. Proper error handling and validation
6. Clean separation of concerns between parent and child flows

The message templates (`SettingsHomeMessage`, `SettingsCategoryMessage`, and `SettingsEditMessage`) would be defined in separate files under the `messages/settings/` directory, following the same pattern as the `CounterMessage` template.

## Troubleshooting

### Common Issues

1. **Message Updates Not Working**

    - Check if messageId is properly set
    - Verify channel permissions
    - Ensure state updates trigger message rebuilds

2. **State Management Problems**

    - Validate state schema
    - Check for undefined values
    - Use proper TypeScript types

3. **Interaction Handling Issues**

    - Verify custom IDs match
    - Check interaction types
    - Implement proper error handling

4. **Sub-flow Problems**
    - Verify parent-child relationships
    - Check state transitions
    - Handle sub-flow results properly

## Additional Resources

- Check the `ExampleFlow.ts` for a complete implementation
- Review the `FlowManager.ts` for flow lifecycle management
- See `counter.ts` for a simple flow example
- Consult the Discord.js documentation for message components

## Advanced Features

### 1. Retry Mechanism

The Flow system includes a built-in retry mechanism for handling transient failures. This is particularly useful for Discord API operations that might fail temporarily.

```typescript
// The retry mechanism is configured with these properties in BaseFlowHandler:
protected readonly maxRetries = 3;        // Maximum number of retry attempts
protected retryCount = 0;                 // Current retry count
protected readonly retryDelay = 1000;     // Base delay in milliseconds

// Example of using the retry mechanism in your flow:
protected async handleInteraction(
    interaction: ButtonInteraction,
    client: Client,
    state: FlowState
): Promise<FlowTransition | void> {
    // The retry mechanism is automatically used for interaction handling
    // It will retry failed operations with exponential backoff
    return await this.retry(
        () => this.performOperation(),
        { interactionId: interaction.id }
    );
}
```

The retry mechanism uses exponential backoff, meaning each retry attempt will wait longer than the previous one. The delay is calculated as: `2^retryCount * retryDelay`.

### 2. Error Handling Patterns

The Flow system provides comprehensive error handling through multiple layers:

1. **Flow-Level Error Handling**

```typescript
// Define custom error handling in your flow
public async onError(client: Client, state: FlowState, error: Error): Promise<void> {
    logger.error({
        flowId: this.id,
        state,
        error: error.message,
        stack: error.stack
    }, 'Flow error occurred');

    // Handle the error appropriately
    await this.end(client, 'error');
}
```

2. **Custom Error Creation**

```typescript
// Create structured errors with codes and details
protected createError(code: string, message: string, details?: Record<string, any>): FlowError {
    const error = new Error(message) as FlowError;
    error.code = code;
    error.details = details;
    return error;
}

// Usage example
if (invalidCondition) {
    throw this.createError(
        'INVALID_STATE',
        'Flow state is invalid',
        { currentState: this.state }
    );
}
```

3. **Error Recovery**

```typescript
// Implement recovery logic in your flow
protected async handleError(client: Client, error: Error): Promise<void> {
    if (error.code === 'RATE_LIMIT') {
        // Handle rate limiting
        await this.retry(() => this.performOperation(), {});
    } else if (error.code === 'INVALID_STATE') {
        // Reset to a known good state
        this.setState(this.getInitialState());
    }
}
```

### 3. History Tracking

The Flow system maintains a history of state changes, which is useful for debugging and implementing undo functionality:

```typescript
// The history is automatically maintained in BaseFlowHandler
protected history: FlowState[] = [];

// Access the history in your flow
public getHistory(): FlowState[] {
    return this.history;
}

// Example of using history for undo functionality
public async undo(client: Client): Promise<void> {
    if (this.history.length > 1) {
        // Remove current state
        this.history.pop();
        // Restore previous state
        const previousState = this.history[this.history.length - 1];
        this.setState(previousState);
        await this.build(client, previousState);
    }
}
```

### 4. Sub-flow Usage

Sub-flows allow you to create nested, modular flows. Here's a comprehensive example:

```typescript
// Parent Flow
export class ParentFlow extends BaseFlowHandler {
	id = 'parent-flow';

	protected async handleInteraction(
		interaction: ButtonInteraction,
		client: Client,
		state: FlowState
	): Promise<FlowTransition | void> {
		if (interaction.customId === 'start-sub-flow') {
			return {
				to: 'parent-flow',
				subFlow: {
					id: 'child-flow',
					initialState: {
						id: 'child-flow',
						data: {
							parentContext: state.data,
						},
					},
				},
			};
		}
	}

	// Handle sub-flow completion
	public async onSubFlowEnd(subFlowId: string, result: any): Promise<void> {
		if (subFlowId === 'child-flow') {
			this.setState({
				...this.getState(),
				data: {
					...this.getState().data,
					subFlowResult: result,
				},
			});
		}
	}
}

// Child Flow
export class ChildFlow extends BaseFlowHandler {
	id = 'child-flow';

	protected async handleInteraction(
		interaction: ButtonInteraction,
		client: Client,
		state: FlowState
	): Promise<FlowTransition | void> {
		if (interaction.customId === 'complete') {
			return {
				returnToParent: true,
				data: {
					result: 'sub-flow completed',
				},
			};
		}
	}
}
```

### 5. Logging System

The Flow system uses a structured logging system for comprehensive debugging and monitoring:

```typescript
// Logging levels and their usage
logger.debug({ flowId: this.id, state }, 'Flow state updated');
logger.info({ flowId: this.id }, 'Flow started successfully');
logger.warn({ flowId: this.id, state }, 'Flow approaching timeout');
logger.error({
    flowId: this.id,
    error: error.message,
    stack: error.stack
}, 'Flow error occurred');

// Common logging patterns in flows
public async onStart(client: Client, state: FlowState): Promise<void> {
    logger.debug({ flowId: this.id, state }, 'Flow started');
}

public async onEnd(client: Client, state: FlowState, reason: string): Promise<void> {
    logger.debug({ flowId: this.id, state, reason }, 'Flow ended');
}

public async onError(client: Client, state: FlowState, error: Error): Promise<void> {
    logger.error({
        flowId: this.id,
        state,
        error: error.message,
        stack: error.stack
    }, 'Flow error occurred');
}

public async onTimeout(client: Client, state: FlowState): Promise<void> {
    logger.warn({ flowId: this.id, state }, 'Flow timed out');
}
```

The logging system includes:

- Structured logging with context objects
- Different log levels (debug, info, warn, error)
- Automatic inclusion of flow ID and state
- Stack traces for errors
- Performance metrics and timing information

Best practices for logging:

1. Always include the flow ID in log messages
2. Use appropriate log levels
3. Include relevant context in structured format
4. Log state changes and important events
5. Include error details when logging errors
6. Use debug level for detailed flow information
7. Use warn level for potential issues
8. Use error level for actual errors

## Flow Usage Examples

### 1. Command Implementation

Here's how to implement a command that starts a flow:

```typescript
import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Command } from '../interfaces';
import { CounterFlow } from '../flows/CounterFlow';
import { logger } from '../util/Logger';

const command: Command = {
	parent: 'test',
	data: new SlashCommandSubcommandBuilder()
		.setName('counter')
		.setDescription('Start a counter flow'),

	async execute(interaction, client) {
		logger.debug('Initializing counter flow command');

		// Validate guild context
		if (!interaction.guild) {
			logger.debug('Command used outside of guild context');
			return interaction.reply({
				content: 'This command can only be used in a server.',
				ephemeral: true,
			});
		}

		try {
			// Start the flow with initial state
			await client.flowManager.startFlow(interaction, new CounterFlow(client), {
				id: 'counter-flow',
				data: {
					count: 0,
					lastUpdated: new Date().toISOString(),
				},
			});

			logger.debug(
				{
					flowId: 'counter-flow',
				},
				'Flow initialized successfully'
			);
		} catch (error) {
			logger.error(
				{
					error: error instanceof Error ? error.message : 'Unknown error',
					stack: error instanceof Error ? error.stack : undefined,
				},
				'Error initializing flow'
			);

			return interaction.reply({
				content: 'An error occurred while initializing the flow.',
				ephemeral: true,
			});
		}
	},
};
```

### 2. Message Builder (Template)

Here's how to create a message builder for the counter flow:

```typescript
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { MessageBuilder } from '../interfaces/MessageBuilder';
import { Client } from '../interfaces/Client';
import { FlowState } from '../interfaces/Flow';
import { logger } from '../util/Logger';
import { MessageComponent as CounterButton } from '../components/buttons/counter';

export const CounterMessage: MessageBuilder = {
	embeds: [
		new EmbedBuilder()
			.setTitle('Simple Counter')
			.setDescription('Click the button below to increment the counter!')
			.addFields([
				{
					name: 'Count',
					value: '0',
					inline: true,
				},
			]),
	],

	components: [],

	async build(client: Client, state: FlowState) {
		logger.debug({ state }, 'Building counter message');

		// Get current count from state
		const count = state.data?.count || 0;
		logger.debug({ count }, 'Current count');

		// Update embed with current count
		const embed = new EmbedBuilder()
			.setTitle('Simple Counter')
			.setDescription('Click the button below to increment the counter!')
			.addFields([
				{
					name: 'Count',
					value: count.toString(),
					inline: true,
				},
			]);

		// Create button
		const button = await CounterButton.build(client, { count });
		logger.debug({ button }, 'Built counter button');

		// Create action row with button
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
		logger.debug({ row }, 'Created action row');

		// Return updated message
		const message = {
			embeds: [embed],
			components: [row],
		};
		logger.debug({ message }, 'Built counter message');
		return message;
	},
};
```

### 3. Message Component (Button)

Here's how to create a button component for the counter flow:

```typescript
import { ButtonBuilder, ButtonStyle, ButtonInteraction } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '../interfaces/MessageComponent';
import { Client } from '../interfaces/Client';
import { logger } from '../util/Logger';

export const MessageComponent: ButtonComponent = {
	// Unique ID for this button component
	id: 'counter',
	type: ComponentTypes.Button,

	// Builds the button to be shown in the message
	async build(client: Client, data: { count: number }) {
		logger.debug({ count: data.count }, 'Building counter button');
		return new ButtonBuilder()
			.setCustomId(client.getCustomID('counter', data))
			.setLabel('Click Me!')
			.setStyle(ButtonStyle.Primary);
	},

	// Handles button click interactions
	async execute(interaction: ButtonInteraction, client: Client, data: { count: number }) {
		logger.debug(
			{
				messageId: interaction.message.id,
				currentCount: data.count,
			},
			'Counter button clicked'
		);

		// Let the flow system handle the interaction
		await client.flowManager.handleInteraction(interaction);
	},
};
```

### 4. Integration Flow

Here's how these components work together:

1. **Command Initialization**

    - User runs the `/test counter` command
    - Command creates a new `CounterFlow` instance
    - Flow is started with initial state via `flowManager.startFlow()`

2. **Message Building**

    - Flow's `build` method calls `CounterMessage.build()`
    - Message builder creates embed and gets button from component
    - Message is sent to Discord

3. **Interaction Handling**

    - User clicks the counter button
    - Button component's `execute` method is called
    - Component delegates to `flowManager.handleInteraction()`
    - Flow's `handleInteraction` method updates state
    - Message is rebuilt with new count

4. **State Management**
    - State is maintained in the flow
    - Message builder reads state to display current count
    - Button component passes current count to flow
    - Flow updates state and triggers message rebuild

This modular approach provides several benefits:

- Separation of concerns between flow logic and UI
- Reusable message components
- Clean state management
- Consistent interaction handling
- Easy to extend and modify
