# BerryBot Interfaces

This document provides an overview of the core interfaces and types used in BerryBot.

## Table of Contents

- [Client Interface](#client-interface)
- [Command Interfaces](#command-interfaces)
- [Event Interface](#event-interface)
- [Flow Interfaces](#flow-interfaces)
- [Message Builder Interface](#message-builder-interface)
- [Message Component Interfaces](#message-component-interfaces)

## Client Interface

The `Client` class extends Discord.js's base client with additional functionality for command handling, event management, and component interactions.

### Properties

- `commands`: Collection of registered slash commands
- `subCommands`: Collection of registered subcommands
- `events`: Collection of registered event handlers
- `messageComponents`: Collection of registered message components
- `flowManager`: Manages flow lifecycle and state transitions
- `database`: Database instance for data persistence

### Methods

#### `constructor(config: { intents: GatewayIntentBits[]; partials: Partials[] })`

Creates a new Client instance with specified intents and partials.

#### `init(): Promise<void>`

Initializes the client by loading events and components, then logs in.

#### `getCustomID(id: string, data?: any): string`

Generates a custom ID for message components with optional compressed data.

## Command Interfaces

### BaseCommand

Interface for top-level slash commands.

```typescript
interface BaseCommand {
	parent?: string; // Optional parent command name
	developer?: boolean; // Whether command is developer-only
	guildOnly?: boolean; // Whether command is guild-only
	data: SlashCommandBuilder; // Command data
	execute(interaction: ChatInputCommandInteraction, client: Client): void;
}
```

### SubCommand

Interface for commands that belong to a parent command.

```typescript
interface SubCommand {
	parent: string; // Parent command name
	data: SlashCommandSubcommandBuilder; // Subcommand data
	execute(interaction: ChatInputCommandInteraction, client: Client): void;
}
```

## Event Interface

Interface for Discord event handlers.

```typescript
interface Event {
	name: string; // Discord event name
	once?: boolean; // Whether event should be handled once
	rest?: boolean; // Whether this is a REST API event
	execute(...args: any[]): void;
}
```

## Flow Interfaces

### FlowState

Represents the current state of a flow.

```typescript
interface FlowState {
	id: string; // Unique identifier
	data?: {
		// Optional state data
		[key: string]: any;
		subFlow?: {
			id: string;
			state: FlowState;
			parent: string;
		};
		subFlowResult?: any;
	};
	previous?: string; // Previous state ID
	interaction?:
		| ButtonInteraction
		| SelectMenuInteraction
		| ModalSubmitInteraction
		| ChatInputCommandInteraction;
}
```

### FlowTransition

Defines how to transition between flow states.

```typescript
interface FlowTransition {
	to: string; // Target state ID
	data?: Record<string, any>; // Optional transition data
	subFlow?: {
		// Optional sub-flow
		id: string;
		initialState: FlowState;
	};
	returnToParent?: boolean; // Whether to return to parent flow
}
```

### FlowHandler

Base interface for all flow handlers.

```typescript
interface FlowHandler {
	id: string;
	stateSchema?: FlowStateSchema;
	security?: FlowSecurityCheck;
	onStart?(client: Client, state: FlowState): Promise<void>;
	onEnd?(client: Client, state: FlowState, reason: string): Promise<void>;
	onError?(client: Client, state: FlowState, error: Error): Promise<void>;
	onTimeout?(client: Client, state: FlowState): Promise<void>;
	build(client: Client, state: FlowState): Promise<any>;
	handle(
		interaction: ComponentInteraction,
		client: Client,
		state: FlowState
	): Promise<FlowTransition | void>;
	getState(): FlowState;
	setState(state: FlowState): void;
	setMessageId(messageId: string): string | null;
}
```

## Message Builder Interface

Interface for building Discord messages with embeds and components.

```typescript
interface MessageBuilder {
	embeds: EmbedBuilder[];
	components: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[];
	build(client: Client, ...args: any): Promise<BaseMessageOptions>;
}
```

## Message Component Interfaces

### ComponentTypes

Enum defining the types of message components.

```typescript
enum ComponentTypes {
	Button = 'BUTTON',
	SelectMenu = 'SELECT_MENU',
	Modal = 'MODAL',
}
```

### BaseMessageComponent

Base interface for all message components.

```typescript
interface BaseMessageComponent {
	id: string;
	type: ComponentTypes;
	multi_select?: boolean;
	permissions?: bigint[];
	developer?: boolean;
	execute(interaction: ComponentInteraction, client: Client, data?: any): void;
	build(client: Client, ...args: any): Promise<ButtonBuilder | SelectMenuBuilder | ModalBuilder>;
}
```

### ButtonComponent

Interface for button components.

```typescript
interface ButtonComponent extends Omit<BaseMessageComponent, 'multi_select'> {
	type: ComponentTypes.Button;
	execute(interaction: ButtonInteraction, client: Client, data?: any): void;
	build(client: Client, ...args: any): Promise<ButtonBuilder>;
}
```

### SelectMenuComponent

Interface for select menu components.

```typescript
interface SelectMenuComponent {
	type: ComponentTypes.SelectMenu;
	multi_select: boolean;
	execute(
		interaction: SelectMenuInteraction,
		client: Client,
		selected: APISelectMenuOption | APISelectMenuOption[],
		data?: any
	): void;
	build(client: Client, ...args: any): Promise<SelectMenuBuilder>;
}
```

### ModalComponent

Interface for modal components.

```typescript
interface ModalComponent extends Omit<BaseMessageComponent, 'execute' | 'multi_select'> {
	type: ComponentTypes.Modal;
	execute(
		interaction: ModalSubmitInteraction,
		client: Client,
		response: Collection<string, TextInputComponent>,
		data?: any
	): void;
	build(client: Client, ...args: any): Promise<ModalBuilder>;
}
```

## Best Practices

1. **Client Usage**

    - Initialize client with proper intents
    - Handle client events appropriately
    - Use custom IDs for components

2. **Command Implementation**

    - Follow Discord's command guidelines
    - Implement proper permission checks
    - Handle command errors gracefully

3. **Event Handling**

    - Use appropriate event types
    - Implement error handling
    - Follow event naming conventions

4. **Flow Management**

    - Maintain state consistency
    - Handle sub-flows properly
    - Implement proper error handling
    - Use timeouts appropriately

5. **Message Building**

    - Follow Discord's message guidelines
    - Use proper embed formatting
    - Implement component validation

6. **Component Implementation**
    - Use proper component types
    - Implement permission checks
    - Handle component interactions properly

## Common Issues

1. **Client Issues**

    - Missing intents
    - Invalid token
    - Rate limiting

2. **Command Issues**

    - Invalid command structure
    - Missing permissions
    - Command conflicts

3. **Event Issues**

    - Event not firing
    - Memory leaks
    - Event conflicts

4. **Flow Issues**

    - State management errors
    - Timeout handling
    - Sub-flow coordination

5. **Message Issues**

    - Invalid embed format
    - Component limits
    - Message size limits

6. **Component Issues**
    - Invalid component type
    - Missing permissions
    - Interaction timeouts
