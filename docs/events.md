# BerryBot Event System Documentation

## Table of Contents

- [BerryBot Event System Documentation](#berrybot-event-system-documentation)
    - [Table of Contents](#table-of-contents)
    - [Overview](#overview)
    - [Event Structure](#event-structure)
        - [Basic Properties](#basic-properties)
        - [Event Types](#event-types)
    - [Event Categories](#event-categories)
        - [1. Client Events](#1-client-events)
        - [2. Interaction Events](#2-interaction-events)
        - [3. REST Events](#3-rest-events)
    - [Event Registration](#event-registration)
    - [Best Practices](#best-practices)
    - [Directory Structure](#directory-structure)
    - [Common Issues](#common-issues)

## Overview

BerryBot's event system provides a structured way to handle Discord events and bot interactions. The system supports various types of events including client events, interaction events, and REST events, with features like:

- **Type Safety**: Full TypeScript support with proper interfaces
- **Event Organization**: Clear categorization of events
- **Automatic Loading**: Dynamic event registration
- **Error Handling**: Comprehensive error handling and logging
- **Client Access**: Built-in access to bot client instance
- **Event Tracking**: Detailed event loading and status reporting

The event system is designed to be:

- **Maintainable**: Clear structure and organization
- **Extensible**: Easy to add new events
- **Reliable**: Robust error handling and logging
- **Performant**: Efficient event handling and registration

## Event Structure

### Basic Properties

| Property  | Type       | Description                             | Required |
| --------- | ---------- | --------------------------------------- | -------- |
| `name`    | `string`   | Discord event name                      | Yes      |
| `execute` | `Function` | Event handler function                  | Yes      |
| `once`    | `boolean`  | Whether the event should only fire once | No       |
| `rest`    | `boolean`  | Whether this is a REST API event        | No       |

### Event Types

1. **Regular Events**

```typescript
export const event: Event = {
	name: Events.InteractionCreate,
	execute(interaction: BaseInteraction, client: Client) {
		// Event handling logic
	},
};
```

2. **Once Events**

```typescript
export const event: Event = {
	name: Events.ClientReady,
	once: true,
	execute(client: Client) {
		// One-time initialization logic
	},
};
```

3. **REST Events**

```typescript
export const event: Event = {
	name: Events.RateLimit,
	rest: true,
	execute(rateLimitInfo: RateLimitData) {
		// REST API rate limit handling
	},
};
```

## Event Categories

### 1. Client Events

Events that are triggered by the Discord client.

Example (Ready Event):

```typescript
import { Event } from '../../interfaces';
import { Events } from 'discord.js';
import { loadCommands } from '../../handlers';
import { Client } from '../../interfaces';
import { logger } from '../../util';

export const event: Event = {
	name: Events.ClientReady,
	once: true,
	execute(client: Client) {
		logger.info(`Logged in as ${client.user?.tag}!`);
		loadCommands(client);
	},
};
```

### 2. Interaction Events

Events that handle user interactions with the bot.

Example (Message Component Event):

```typescript
import { BaseInteraction, Events } from 'discord.js';
import { Client, Event } from '../../interfaces';
import { logger } from '../../util';

export const event: Event = {
	name: Events.InteractionCreate,
	execute(interaction: BaseInteraction, client: Client) {
		// Only handle specific interaction types
		if (!interaction.isMessageComponent()) return;

		logger.debug(`Received message component interaction: ${interaction.customId}`);

		// Handle the interaction
		try {
			// Interaction handling logic
		} catch (error) {
			logger.error({ error }, 'Error handling interaction');
		}
	},
};
```

### 3. REST Events

Events that are triggered by Discord's REST API.

Example (Rate Limit Event):

```typescript
import { Event } from '../../interfaces';
import { Events } from 'discord.js';
import { logger } from '../../util';

export const event: Event = {
	name: Events.RateLimit,
	rest: true,
	execute(rateLimitInfo: RateLimitData) {
		logger.warn(
			{
				limit: rateLimitInfo.limit,
				timeToReset: rateLimitInfo.timeToReset,
				path: rateLimitInfo.path,
			},
			'Rate limit hit'
		);
	},
};
```

## Event Registration

Events are automatically registered by the `EventHandler`. The handler:

1. Loads all event files from the events directory
2. Validates event structure
3. Registers events with Discord's client or REST API
4. Generates a loading report

Example registration process:

```typescript
export const loadEvents = async (client: Client) => {
	// Clear existing events
	await client.events.clear();

	// Load event files
	const files = await Files.load('events');

	// Process each event file
	files.forEach((file: string) => {
		const { event } = require(file);

		// Create event handler with client instance
		const execute = (...args: any[]) => {
			event.execute(...args, client);
		};

		// Register event based on type
		if (event.rest) {
			client.rest.on(event.name, execute);
		} else if (event.once) {
			client.once(event.name, execute);
		} else {
			client.on(event.name, execute);
		}
	});
};
```

## Best Practices

1. **Error Handling**

    - Always implement proper error handling
    - Use try-catch blocks for async operations
    - Log errors with relevant context
    - Provide graceful fallbacks

2. **Event Organization**

    - Group related events in subdirectories
    - Use clear, descriptive names
    - Document event functionality
    - Follow consistent naming conventions

3. **Performance**

    - Keep event handlers efficient
    - Use appropriate event types
    - Implement proper cleanup
    - Handle rate limits appropriately

4. **Logging**

    - Log important events and errors
    - Include relevant context in logs
    - Use appropriate log levels
    - Structure log data consistently

5. **Type Safety**
    - Use proper TypeScript types
    - Validate event data
    - Handle type edge cases
    - Document type requirements

## Directory Structure

```
src/
└── events/
    ├── Client/           # Client events (ready, error, etc.)
    ├── Interactions/     # Interaction events (commands, components)
    └── REST/            # REST API events (rate limits, etc.)
```

## Common Issues

1. **Event Not Firing**

    - Check event name matches Discord's event names
    - Verify event is properly registered
    - Ensure proper error handling
    - Check event type (regular/once/REST)

2. **Memory Leaks**

    - Properly clean up event listeners
    - Handle event timeouts
    - Implement proper error recovery
    - Monitor event handler performance

3. **Rate Limiting**

    - Handle REST API rate limits
    - Implement proper backoff strategies
    - Monitor rate limit usage
    - Cache when appropriate

4. **Type Errors**
    - Verify event parameter types
    - Handle optional parameters
    - Validate event data
    - Use proper type guards
