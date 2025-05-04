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
    - [Persistent Flows](#persistent-flows)
        - [Overview](#persistent-flows-overview)
        - [How to Create a Persistent Flow](#how-to-create-a-persistent-flow)
        - [Database Schema](#database-schema)
        - [Registration Process](#registration-process)
        - [Flow Restoration](#flow-restoration)
    - [Best Practices](#best-practices)
    - [Example Implementation](#example-implementation)
        - [1. Simple Counter Flow](#1-simple-counter-flow)
        - [2. Role Configuration Flow](#2-role-configuration-flow)
        - [3. Persistent Role Configuration Flow](#3-persistent-role-configuration-flow)
    - [Troubleshooting](#troubleshooting)
        - [Common Issues](#common-issues)
    - [Additional Resources](#additional-resources)

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
- **Persistence**: Support for flows that persist across bot restarts

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
	PermissionsBitField,
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
			if (interaction.guild) {
				const permissions = interaction.member?.permissions;
				return permissions instanceof PermissionsBitField
					? permissions.has(PermissionsBitField.Flags.ManageRoles)
					: false;
			}
			return false;
		},
		checkState: async (state) => {
			// Validate state
			return true;
		},
	};

	// Required: Build the message for this flow
	async build(client: Client, state: FlowState): Promise<Message | void> {
		logger.debug({ flowId: this.id, state }, 'Building MyNewFlow');
		const { interaction } = state || {};

		// Build your message here
		const message = await MyMessageBuilder.build(client, state);

		// Handle updating an existing message
		if (this.messageId && interaction?.channelId) {
			return this.updateMessage(client, message);
		}
		// Handle creating a new message via interaction
		else if (interaction) {
			return this.createMessage(interaction, message);
		}

		logger.error({ flowId: this.id }, 'No valid message target found for build');
	}

	// Required: Handle interactions
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
		// Handle the interaction
		if (!('customId' in interaction)) return;

		const { id, parent, group, data } = componentData || { id: '' };

		// Handle different interaction types
		if (interaction instanceof ButtonInteraction) {
			switch (group) {
				case 'my-group':
					switch (id) {
						case 'action1':
							return {
								to: 'next-state',
								data: {
									// Updated data
								},
							};
					}
			}
		}
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

The `build` method should create the message that users will see. Use message builders to separate UI logic from flow logic:

```typescript
async build(client: Client, state: FlowState): Promise<Message | void> {
	logger.debug({ flowId: this.id, state }, 'Building MyNewFlow');
	const { interaction } = state || {};

	// Build your message here
	const message = await MyMessageBuilder.build(client, state);

	// Handle updating an existing message
	if (this.messageId && interaction?.channelId) {
		return this.updateMessage(client, message);
	}
	// Handle creating a new message via interaction
	else if (interaction) {
		return this.createMessage(interaction, message);
	}

	logger.error({ flowId: this.id }, 'No valid message target found for build');
}
```

### 4. Interaction Handling

Handle user interactions in the `handleInteraction` method:

```typescript
protected async handleInteraction(
	interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction | ChatInputCommandInteraction,
	client: Client,
	state: FlowState,
	componentData?: {
		id: string;
		parent?: string;
		group?: string;
		data?: any;
	}
): Promise<FlowTransition | void> {
	if (!('customId' in interaction)) return;

	const { id, parent, group, data } = componentData || { id: '' };

	// Handle different interaction types
	if (interaction instanceof ButtonInteraction) {
		switch (group) {
			case 'my-group':
				switch (id) {
					case 'action1':
						return {
							to: 'next-state',
							data: {
								// Updated data
							}
						};
				}
		}
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

## Persistent Flows

### Persistent Flows Overview

Persistent flows are flows that maintain their state even after the bot restarts. This is useful for long-running flows that need to survive application restarts, such as role management interfaces, configuration panels, or any interaction that should remain available for extended periods.

Key features of persistent flows:

- State is saved to a MongoDB database
- Automatically restored when the bot starts
- Handles flow expiration
- Supports guild-wide and user-specific flows
- Requires minimal configuration to implement

### How to Create a Persistent Flow

To create a persistent flow, follow these steps:

1. Extend the `BaseFlowHandler` as you would for a regular flow
2. Set the `persistent` property to `true` in your flow class
3. Make sure your flow's `id` matches one of the flow types in the `Flows` schema
4. The rest is handled automatically by the BaseFlowHandler

Example:

```typescript
export class PersistentRoleConfigFlow extends BaseFlowHandler {
	id = 'ROLE_CONFIG'; // Must match a flow type in the schema
	persistent = true; // Enable persistence

	// Regular flow implementation
	state: FlowState = {
		id: 'main-menu',
		data: {},
	};

	// ... rest of your flow implementation
}
```

The `BaseFlowHandler` will automatically:

- Save the flow state to the database when it changes (`persistFlow`)
- Remove the flow from the database when it ends (`unpersistFlow`)
- Handle all database operations in the background

### Database Schema

Persistent flows are stored in the MongoDB database using the `Flows` schema, which is defined in `src/database/schemas/Flows.ts`:

```typescript
const FlowsSchema = new mongoose.Schema({
	guildId: {
		type: String,
		required: true,
		index: true,
	},
	messageId: {
		type: String,
		required: true,
		index: true,
	},
	userId: {
		type: String,
		required: false,
		index: true,
	},
	flowType: {
		type: String,
		required: true,
		enum: ['ROLE_SELECT', 'ROLE_CONFIG'], // Add other flow types here
		index: true,
	},
	currentState: {
		id: {
			type: String,
			required: true,
		},
		data: {
			type: Map,
			of: mongoose.Schema.Types.Mixed,
			default: new Map(),
		},
		previous: {
			type: String,
			required: false,
		},
	},
	data: {
		type: Map,
		of: mongoose.Schema.Types.Mixed,
		default: new Map(),
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	expiresAt: {
		type: Date,
		required: false,
	},
});

// Indexes for efficient querying
FlowsSchema.index({ messageId: 1 }, { unique: true });
FlowsSchema.index({ guildId: 1, flowType: 1 });
FlowsSchema.index({ guildId: 1, userId: 1, flowType: 1 }, { sparse: true });
```

To add a new flow type to the schema, update the `enum` array in the `flowType` field with your new uppercase flow type.

### Registration Process

When the bot starts, it automatically registers all active persistent flows from the database. This is handled in `src/events/Client/ready.ts`:

```typescript
async function registerFlows(client: Client) {
	try {
		logger.info('Registering active flows...');
		const flows = await database.flows.model.find({
			expiresAt: { $gt: new Date() },
		});

		for (const flow of flows) {
			try {
				// Create a new handler instance based on flow type
				let handler;
				switch (flow.flowType) {
					case 'ROLE_CONFIG':
						handler = new RoleConfigFlow(client);
						break;
					// Add cases for other flow types here
					default:
						logger.warn(`Unknown flow type: ${flow.flowType}`);
						continue;
				}

				// Set the state from the database
				handler.setState(flow.currentState);

				// Register the handler with the message ID
				client.flowManager.registerHandler(flow.messageId, handler);
				logger.info(`Registered flow: ${flow.flowType} (${flow.messageId})`);
			} catch (error) {
				logger.error(
					{ error },
					`Failed to register flow: ${flow.flowType} (${flow.messageId})`
				);
			}
		}

		logger.info(`Registered ${flows.length} active flows`);
	} catch (error) {
		logger.error({ error }, 'Failed to register flows');
	}
}
```

When adding a new persistent flow type, you need to:

1. Add the flow type to the `flowType` enum in the `Flows` schema
2. Add a case for your flow type in the `switch` statement in `registerFlows`

### Flow Restoration

When a persistent flow is registered at startup:

1. The appropriate flow handler is instantiated
2. Its state is restored from the database
3. The handler is registered with the FlowManager
4. The flow can immediately handle interactions without rebuilding the message

The flow's state, including all data and the current position in the flow, is preserved exactly as it was before the bot restart.

## Best Practices

1. **State Management**

    - Keep state data minimal and focused
    - Use TypeScript interfaces to define state structure
    - Validate state changes before applying them
    - Use the `stateSchema` to enforce data requirements

2. **Error Handling**

    - Implement proper error handling in all async operations
    - Use the built-in retry mechanism for transient failures
    - Log errors with appropriate context
    - Return error embeds instead of throwing errors

3. **Security**

    - Always implement permission checks
    - Validate user input
    - Sanitize data before storing in state
    - Use the `security` object to define checks

4. **Performance**

    - Minimize state updates
    - Use efficient message updates
    - Clean up resources when flow ends
    - Avoid unnecessary message rebuilds

5. **User Experience**
    - Provide clear feedback for user actions
    - Handle edge cases gracefully
    - Implement proper timeout handling
    - Use appropriate message components

## Example Implementation

### 1. Simple Counter Flow

Here's a complete example of a simple counter flow:

```typescript
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
			return this.updateMessage(client, message);
		} else if (state.interaction) {
			return this.createMessage(state.interaction, message);
		}
	}

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
		if (!('customId' in interaction)) return;

		const { id, data } = componentData || { id: '' };

		if (id === 'increment') {
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

### 2. Role Configuration Flow

Here's an example of a more complex flow for managing role configurations:

```typescript
export class RoleConfigFlow extends BaseFlowHandler {
	id = 'role-config';

	state: FlowState = {
		id: 'main-menu',
		data: {},
	};

	stateSchema = {
		required: [],
		optional: ['action', 'category', 'roles', 'name', 'emoji'],
		validate: (state: FlowState) => {
			return true;
		},
	};

	security = {
		checkPermissions: async (interaction) => {
			if (interaction.guild) {
				const permissions = interaction.member?.permissions;
				return permissions instanceof PermissionsBitField
					? permissions.has(PermissionsBitField.Flags.ManageRoles)
					: false;
			}
			return false;
		},
		checkState: async (state) => {
			return true;
		},
	};

	async build(client: Client, state: FlowState): Promise<Message | void> {
		logger.debug({ flowId: this.id, state }, 'Building RoleConfigFlow');
		const { interaction } = state || {};

		let messageOpts: BaseMessageOptions = {
			embeds: [],
			components: [],
		};

		switch (state.id) {
			case 'main-menu':
				messageOpts = await MainMenu.build(client, state);
				break;
			// Handle other states...
		}

		if (this.messageId && interaction?.channelId) {
			return this.updateMessage(client, messageOpts);
		} else if (interaction) {
			return this.createMessage(interaction, messageOpts);
		}
	}

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
		if (!('customId' in interaction)) return;

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
					}
			}
		}
	}
}
```

### 3. Persistent Role Configuration Flow

Here's an example of a persistent role configuration flow:

```typescript
export class PersistentRoleConfigFlow extends BaseFlowHandler {
	id = 'ROLE_CONFIG';
	persistent = true; // Enable persistence

	state: FlowState = {
		id: 'main-menu',
		data: {},
	};

	stateSchema = {
		required: [],
		optional: ['action', 'category', 'roles', 'name', 'emoji'],
		validate: (state: FlowState) => {
			return true;
		},
	};

	security = {
		checkPermissions: async (interaction) => {
			if (interaction.guild) {
				const permissions = interaction.member?.permissions;
				return permissions instanceof PermissionsBitField
					? permissions.has(PermissionsBitField.Flags.ManageRoles)
					: false;
			}
			return false;
		},
	};

	async build(client: Client, state: FlowState): Promise<Message | void> {
		// Implementation as in regular flow
	}

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
		// Implementation as in regular flow
	}

	// Optional: Override persistFlow for custom persistence logic
	async persistFlow(client: Client): Promise<void> {
		// Custom persistence logic if needed
		// If not overridden, BaseFlowHandler.persistFlow will be used
		await super.persistFlow(client);

		// Additional persistence operations...
	}
}
```

## Troubleshooting

### Common Issues

1. **Message Updates Not Working**

    - Check if messageId is properly set
    - Verify channel permissions
    - Ensure state updates trigger message rebuilds
    - Check for recursive update loops

2. **State Management Problems**

    - Validate state schema
    - Check for undefined values
    - Use proper TypeScript types
    - Avoid unnecessary state updates

3. **Interaction Handling Issues**

    - Verify custom IDs match
    - Check interaction types
    - Implement proper error handling
    - Use parseData for custom IDs

4. **Sub-flow Problems**

    - Verify parent-child relationships
    - Check state transitions
    - Handle sub-flow results properly
    - Clean up sub-flow state

5. **Persistence Issues**
    - Check flow type matches the enum in Flows schema
    - Verify the `persistent` flag is set to true
    - Check database connectivity
    - Look for expiration issues (flows may have expired)
    - Ensure `messageId` is set correctly

## Additional Resources

- Check the `ExampleFlow.ts` for a complete implementation
- Review the `FlowManager.ts`
