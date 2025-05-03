# BerryBot Message Component System Documentation

## Table of Contents

- [BerryBot Message Component System Documentation](#berrybot-message-component-system-documentation)
    - [Table of Contents](#table-of-contents)
    - [Overview](#overview)
    - [Component Types](#component-types)
        - [1. Buttons](#1-buttons)
        - [2. Select Menus](#2-select-menus)
        - [3. Modals](#3-modals)
    - [Component Structure](#component-structure)
        - [Basic Properties](#basic-properties)
        - [Build Method](#build-method)
        - [Execute Method](#execute-method)
    - [Persistent Component Data](#persistent-component-data)
        - [Basic Usage](#basic-usage)
        - [Data Limitations](#data-limitations)
        - [Best Practices](#best-practices)
        - [Example Implementation](#example-implementation)
    - [Directory Structure](#directory-structure)
    - [Best Practices](#best-practices-1)
    - [Component Registration](#component-registration)
    - [Common Issues](#common-issues)

## Overview

BerryBot's message component system provides a robust framework for creating interactive Discord messages. The system supports various types of interactive components and offers features for state management, data persistence, and user interaction. Key features include:

- **Component Types**: Support for buttons, select menus, and modals
- **State Management**: Built-in support for persistent component data
- **Type Safety**: Full TypeScript support with proper interfaces
- **Custom ID System**: Secure and efficient custom ID generation
- **Error Handling**: Comprehensive error handling and logging
- **Permission Control**: Fine-grained permission management
- **Component Organization**: Clear structure and separation of concerns

The component system is designed to be:

- **Reusable**: Components can be easily shared and reused
- **Maintainable**: Clear structure and organization
- **Secure**: Built-in data validation and sanitization
- **Performant**: Efficient state management and data handling

## Component Types

Each component must be named `MessageComponent` and use its corresponding interface from the MessageComponent interfaces:

```typescript
// Button Component
import { ButtonComponent, ComponentTypes } from '../interfaces/MessageComponent';
export const MessageComponent: ButtonComponent = {
	// Component implementation
};

// Select Menu Component
import { SelectMenuComponent, ComponentTypes } from '../interfaces/MessageComponent';
export const MessageComponent: SelectMenuComponent = {
	// Component implementation
};

// Modal Component
import { ModalComponent, ComponentTypes } from '../interfaces/MessageComponent';
export const MessageComponent: ModalComponent = {
	// Component implementation
};
```

### 1. Buttons

Interactive clickable elements that can trigger actions or navigation.
Located in `src/components/buttons/`

```typescript
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '../interfaces/MessageComponent';

export const MessageComponent: ButtonComponent = {
	id: 'example-button',
	type: ComponentTypes.Button,
	async build(client, data) {
		return new ButtonBuilder()
			.setCustomId(client.getCustomID(this.id, data))
			.setLabel('Click Me')
			.setStyle(ButtonStyle.Primary);
	},
};
```

### 2. Select Menus

Dropdown menus for selecting one or multiple options.
Located in `src/components/selectMenus/`

```typescript
import { StringSelectMenuBuilder } from 'discord.js';
import { SelectMenuComponent, ComponentTypes } from '../interfaces/MessageComponent';

export const MessageComponent: SelectMenuComponent = {
	id: 'example-select',
	type: ComponentTypes.SelectMenu,
	multi_select: true,
	async build(client, data) {
		return new StringSelectMenuBuilder()
			.setCustomId(client.getCustomID(this.id, data))
			.setPlaceholder('Select Options')
			.setMinValues(1)
			.setMaxValues(3)
			.addOptions([
				{ label: 'Option 1', value: 'opt1' },
				{ label: 'Option 2', value: 'opt2' },
			]);
	},
};
```

### 3. Modals

Form-like interfaces for collecting user input.
Located in `src/components/modals/`

```typescript
import { ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ModalComponent, ComponentTypes } from '../interfaces/MessageComponent';

export const MessageComponent: ModalComponent = {
	id: 'example-modal',
	type: ComponentTypes.Modal,
	async build(client, data) {
		const input = new TextInputBuilder()
			.setCustomId('input')
			.setLabel('Enter Text')
			.setStyle(TextInputStyle.Short);

		return new ModalBuilder()
			.setCustomId(client.getCustomID(this.id, data))
			.setTitle('Example Modal')
			.addComponents(input);
	},
};
```

## Component Structure

### Basic Properties

| Property       | Type                    | Description                                    | Required |
| -------------- | ----------------------- | ---------------------------------------------- | -------- |
| `id`           | `string`                | Unique identifier for the component            | Yes      |
| `type`         | `ComponentTypes`        | Type of component (Button/SelectMenu/Modal)    | Yes      |
| `permissions`  | `PermissionFlagsBits[]` | Required permissions to use the component      | No       |
| `multi_select` | `boolean`               | Enable multiple selections (Select Menus only) | No       |

### Build Method

The `build` method creates the component instance with its configuration:

```typescript
async build(client: Client, data?: any) {
    // Create and configure component
    return component;
}
```

### Execute Method

The `execute` method handles component interactions:

```typescript
async execute(interaction: ComponentInteraction, client: Client, data?: any) {
    // Handle interaction
}
```

## Persistent Component Data

Components can store persistent data in their custom IDs using the client's `getCustomID` function. This allows components to maintain state between interactions without requiring database storage.

### Basic Usage

```typescript
// Store simple data
const data = { count: 5 };
const customId = client.getCustomID('button-id', data);

// Store complex data
const modal_data = {
	type: 'modal',
	id: 'mod_history',
	userId: '123456789012345678',
	page: 2,
	filters: {
		sort: 'recent',
		category: 'moderation',
		tags: ['bans', 'kicks', 'mutes'],
		priority: 'high',
		resolved: false,
	},
};
const button_id = await client.getCustomID('open-history', modal_data);
// console.log(button_id) => open-history[ᯡࠫ䅜Ā匰ᜨאỠጢణㄠ㑀আ䆅栯倢恠材⠤炯ࠢ巉你䦃ࠨ怩䀹䀥䀵䀭䀽䀣䀳䀡䁄≬獈డ暑爛瀣ᠲ挡浡ᑕ͐ጔ〣ಀǹ々壬㇁䧂⩔ຎѰ໬ね⧜;∠ɐ恚丐öɻʜ㤥䲊〥氁∈ș䠲ᔦ䊹䎁㋠ǘ悘竸瘠⿃⠠]
```

### Data Limitations

- Custom IDs must be under 100 characters
- Data is automatically compressed and encoded
- Complex objects are serialized to JSON
- Arrays and nested objects are supported

### Best Practices

1. **Data Size**

    - Keep data minimal and essential
    - Avoid storing large objects
    - Use references when possible

2. **Data Security**

    - Never store sensitive information
    - Validate data before use
    - Sanitize user input

3. **Data Structure**
    - Use consistent data formats
    - Include type information
    - Document data structure

### Example Implementation

```typescript
export const MessageComponent: ButtonComponent = {
	id: 'example-button',
	type: ComponentTypes.Button,

	async build(client, data) {
		// Store data in custom ID
		const customId = client.getCustomID(this.id, {
			action: 'increment',
			count: data.count || 0,
			timestamp: Date.now(),
		});

		return new ButtonBuilder()
			.setCustomId(customId)
			.setLabel('Click Me')
			.setStyle(ButtonStyle.Primary);
	},

	async execute(interaction, client, data) {
		// Access stored data
		const { count, timestamp } = data;
		// Handle interaction
	},
};
```

## Directory Structure

```
src/
└── components/
    ├── buttons/         # Button Components
    ├── modals/          # Modals
    └── selectMenus/     # Select Menus

## Best Practices

1. **Component IDs**
   - Use descriptive, unique IDs
   - Follow a consistent naming convention
   - Include component type in the ID

2. **Data Handling**
   - Keep custom IDs under 100 characters
   - Use JSON for complex data structures
   - Validate data before processing

3. **Error Handling**
   - Implement proper error checks
   - Provide user feedback for errors
   - Log errors for debugging

4. **Permissions**
   - Check user permissions before execution
   - Provide clear feedback for permission issues
   - Use the `permissions` property when appropriate

5. **State Management**
   - Use the flow system for complex interactions
   - Maintain state in component data
   - Clear state when no longer needed

## Component Registration

Components are automatically registered by the `MessageComponentHandler`:
1. Components are loaded from their respective directories
2. Each component is validated and registered
3. Components are stored in the client's component collection
4. A loading report is generated

## Common Issues

1. **Component Not Responding**
   - Check component ID matches
   - Verify component is properly registered
   - Ensure proper error handling

2. **Permission Issues**
   - Verify required permissions
   - Check bot permissions
   - Validate user permissions

3. **Data Serialization**
   - Keep custom IDs under size limit
   - Validate data structure
   - Handle data parsing errors

4. **Interaction Timeouts**
   - Implement proper timeout handling
   - Use deferred replies for long operations
   - Clear components after timeout
```
