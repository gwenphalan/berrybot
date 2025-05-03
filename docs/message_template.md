# BerryBot Message Template System Documentation

## Table of Contents

- [BerryBot Message Template System Documentation](#berrybot-message-template-system-documentation)
    - [Table of Contents](#table-of-contents)
    - [Overview](#overview)
    - [Message Template Structure](#message-template-structure)
        - [Basic Properties](#basic-properties)
        - [Build Method](#build-method)
    - [Template Types](#template-types)
        - [1. Simple Templates](#1-simple-templates)
        - [2. Interactive Templates](#2-interactive-templates)
        - [3. Dynamic Templates](#3-dynamic-templates)
    - [Best Practices](#best-practices)
    - [Directory Structure](#directory-structure)
    - [Common Issues](#common-issues)
    - [Flow Integration](#flow-integration)
        - [Basic Flow Integration](#basic-flow-integration)
        - [Flow State Management](#flow-state-management)
        - [Best Practices for Flow Integration](#best-practices-for-flow-integration)

## Overview

BerryBot's message template system provides a structured way to create and manage reusable Discord messages. The system supports various types of messages including embeds, components, and interactive elements, with a focus on reusability and maintainability.

## Message Template Structure

### Basic Properties

| Property     | Type                 | Description                 | Required |
| ------------ | -------------------- | --------------------------- | -------- |
| `embeds`     | `EmbedBuilder[]`     | Array of message embeds     | Yes      |
| `components` | `ActionRowBuilder[]` | Array of message components | Yes      |
| `build`      | `Function`           | Template building method    | Yes      |

### Build Method

The `build` method creates the message instance with its configuration:

```typescript
async build(client: Client, ...args: any[]) {
    // Create and configure message
    return {
        embeds: this.embeds,
        components: this.components
    };
}
```

## Template Types

### 1. Simple Templates

Basic templates with static content and minimal interaction.

Example:

```typescript
export const example: MessageBuilder = {
	embeds: [new EmbedBuilder().setTitle('Example').setDescription('This is an example message.')],
	components: [new ActionRowBuilder<ButtonBuilder>()],
	async build(client) {
		// Add components and return message
		return {
			embeds: this.embeds,
			components: this.components,
		};
	},
};
```

### 2. Interactive Templates

Templates that include interactive components like buttons and select menus.

Example:

```typescript
export const counter: MessageBuilder = {
	embeds: [
		new EmbedBuilder()
			.setTitle('Simple Counter')
			.setDescription('Click the button below to increment the counter!'),
	],
	components: [],
	async build(client, state) {
		// Update embed with current state
		const count = state.data?.count || 0;
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

		// Add interactive components
		const button = await CounterButton.build(client, { count });
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

		return {
			embeds: [embed],
			components: [row],
		};
	},
};
```

### 3. Dynamic Templates

Templates that adapt their content based on external data or user input.

Example:

```typescript
export const paginator: MessageBuilder = {
	embeds: [new EmbedBuilder().setTitle('Paginator').setDescription('Loading...')],
	components: [],
	async build(client, id, pages, title, options) {
		// Register paginator in collection
		books.set(id, pages);

		// Build navigation components
		const backButton = await buttons.Paginator.BackButton.build(client, { id });
		const nextButton = await buttons.Paginator.NextButton.build(client, { id });
		const closeButton = await buttons.Paginator.CloseButton.build(client);

		// Create action row
		const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			backButton,
			nextButton,
			closeButton
		);

		// Update embed with current page
		this.embeds[0]
			.setDescription(pages[options.currentPage])
			.setTitle(`${title} [${options.currentPage + 1}/${pages.length}]`);

		return {
			embeds: this.embeds,
			components: [actionRow],
		};
	},
};
```

## Best Practices

1. **State Management**

    - Use the `build` method to handle state updates
    - Keep state data minimal and essential
    - Validate state data before use
    - Use TypeScript interfaces for state types

2. **Component Organization**

    - Group related components in action rows
    - Follow Discord's component limits (5 buttons per row)
    - Use consistent component styling
    - Implement proper error handling for component interactions

3. **Embed Design**

    - Use consistent color schemes
    - Keep embed content concise and organized
    - Use fields for structured data
    - Include relevant metadata (timestamps, footers)

4. **Error Handling**

    - Implement proper error checks
    - Provide user feedback for errors
    - Log errors for debugging
    - Handle edge cases gracefully

5. **Performance**
    - Minimize database queries
    - Cache frequently used data
    - Use efficient data structures
    - Implement proper cleanup

## Directory Structure

```
src/
└── messages/
    ├── counter.ts
    ├── example.ts
    ├── index.ts
    ├── paginator.ts
    ├── role-category.ts
    ├── role-category-select.ts
    ├── role-select.ts
    └── self-role.ts
```

## Common Issues

1. **Component Limits**

    - Discord limits: 5 buttons per row, 5 rows per message
    - Use select menus for large option sets
    - Implement proper overflow handling

2. **State Management**

    - Issue: State loss between interactions
    - Solution: Use persistent storage or custom IDs
    - Implement proper state validation
    - Handle state cleanup

3. **Permission Issues**

    - Issue: Missing bot permissions
    - Solution: Check permissions before building
    - Provide clear error messages
    - Implement fallback behavior

4. **Rate Limiting**
    - Issue: Discord API rate limits
    - Solution: Implement proper rate limit handling
    - Use deferred replies for long operations
    - Cache frequently used data

## Flow Integration

Message templates can be integrated with BerryBot's flow system to create interactive, stateful experiences. The flow system manages the state and lifecycle of interactive messages.

### Basic Flow Integration

```typescript
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { MessageBuilder } from '../interfaces/MessageBuilder';
import { Client } from '../interfaces/Client';
import { FlowState } from '../interfaces/Flow';
import { logger } from '../util/Logger';
import { MessageComponent as CounterButton } from '../components/buttons/counter';

export const CounterMessage: MessageBuilder = {
	// Initial embed setup
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

	// Build method with flow state
	async build(client: Client, state: FlowState) {
		logger.debug({ state }, 'Building counter message');

		// Get current count from flow state
		const count = state.data?.count || 0;
		logger.debug({ count }, 'Current count');

		// Update embed with current state
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

		// Build interactive component with state
		const button = await CounterButton.build(client, { count });
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

		return {
			embeds: [embed],
			components: [row],
		};
	},
};
```

### Flow State Management

1. **State Access**

    - Access flow state through the `state` parameter in the `build` method
    - Use optional chaining for safe state access: `state.data?.property`
    - Provide default values for missing state: `state.data?.count || 0`

2. **State Updates**

    - State updates are handled by the flow system
    - Components can trigger state updates through their execute methods
    - The message template rebuilds when state changes

3. **Logging**
    - Use the logger utility for debugging flow state
    - Log state changes and component interactions
    - Include relevant state data in log messages

### Best Practices for Flow Integration

1. **State Structure**

    - Keep state data minimal and essential
    - Use TypeScript interfaces for state types
    - Document state structure
    - Validate state data before use

2. **Component Integration**

    - Pass relevant state to components
    - Handle state updates in component execute methods
    - Use consistent state access patterns
    - Implement proper error handling

3. **Performance**

    - Minimize state updates
    - Cache frequently accessed state
    - Use efficient data structures
    - Implement proper cleanup

4. **Error Handling**
    - Handle missing or invalid state
    - Provide fallback values
    - Log state-related errors
    - Implement graceful degradation
