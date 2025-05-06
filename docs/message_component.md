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
        - [Custom ID Format](#custom-id-format)
        - [ID Structure Hierarchy](#id-structure-hierarchy)
        - [Flow Interaction Handling](#flow-interaction-handling)
        - [Supported Formats](#supported-formats)
        - [Basic Usage](#basic-usage)
        - [Data Limitations](#data-limitations)
        - [Best Practices](#best-practices)
        - [Example Implementation](#example-implementation)
    - [Directory Structure](#directory-structure)
    - [Best Practices](#best-practices-1)
    - [Component Registration](#component-registration)
    - [Common Issues](#common-issues)

## Overview

Message components in BerryBot are modular, reusable UI elements that can be added to Discord messages. They include buttons, select menus, and modals, each with their own interaction handling. All components are implemented as classes extending abstract base classes, providing type safety, modularity, and extensibility.

## Component Types

Each component is implemented as a class extending the appropriate abstract base class from `src/core/classes/`:

### 1. Buttons

Interactive clickable elements that can trigger actions or navigation.
Located in `src/components/buttons/`

```typescript
import { ButtonComponent } from '@/core/classes/ButtonComponent';
import type { Client } from '@/core/client/BerryClient';
import * as discord from 'discord.js';

class ExampleButton extends ButtonComponent<{ count?: number }> {
	id = 'example-button';
	label = 'Click Me';
	style = discord.ButtonStyle.Primary;

	async build(client: Client, data?: { count?: number }) {
		return await super.build(client, data);
	}

	async execute(
		interaction: discord.ButtonInteraction,
		client: Client,
		data?: { count?: number }
	) {
		// Handle interaction
	}
}

export default ExampleButton;
```

### 2. Select Menus

Dropdown menus for selecting one or multiple options.
Located in `src/components/selectMenus/`

```typescript
import { StringSelectMenuComponent } from '@/core/classes/StringSelectMenuComponent';
import type { Client } from '@/core/client/BerryClient';
import * as discord from 'discord.js';

class ExampleSelectMenu extends StringSelectMenuComponent<object> {
	id = 'example-select';
	placeholder = 'Select Options';
	min_values = 1;
	max_values = 3;

	async build(client: Client, options?: { data?: object }) {
		return await super.build(client, {
			placeholder: this.placeholder,
			min_values: this.min_values,
			max_values: this.max_values,
			options: [
				{ label: 'Option 1', value: 'opt1' },
				{ label: 'Option 2', value: 'opt2' },
			],
			...options,
		});
	}

	async execute(
		interaction: discord.StringSelectMenuInteraction,
		client: Client,
		selected: discord.APISelectMenuOption,
		data?: object
	) {
		// Handle interaction
	}
}

export default ExampleSelectMenu;
```

### 3. Modals

Form-like interfaces for collecting user input.
Located in `src/components/modals/`

```typescript
import { ModalComponent, TextInputOptions } from '@/core/classes/ModalComponent';
import type { Client } from '@/core/client/BerryClient';
import * as discord from 'discord.js';

class ExampleModal extends ModalComponent<object> {
	id = 'example-modal';
	title = 'Example Modal';
	fields = [
		new discord.TextInputBuilder()
			.setCustomId('input')
			.setLabel('Enter Text')
			.setStyle(discord.TextInputStyle.Short),
	];

	async build(client: Client, options?: { data?: object }) {
		return await super.build(client, options);
	}

	async execute(
		interaction: discord.ModalSubmitInteraction,
		client: Client,
		fields: discord.Collection<string, discord.TextInputComponent>,
		data?: object
	) {
		// Handle interaction
	}
}

export default ExampleModal;
```

## Component Structure

### Basic Properties

| Property       | Type                    | Description                                    | Required |
| -------------- | ----------------------- | ---------------------------------------------- | -------- |
| `id`           | `string`                | Unique identifier for the component            | Yes      |
| `parent`       | `string`                | Parent identifier for hierarchical IDs         | No       |
| `group`        | `string`                | Group identifier for hierarchical IDs          | No       |
| `style`        | `ButtonStyle`           | Button style (buttons only)                    | No       |
| `label`        | `string`                | Button label (buttons only)                    | No       |
| `placeholder`  | `string`                | Placeholder text (select menus only)           | No       |
| `min_values`   | `number`                | Minimum selections (select menus only)         | No       |
| `max_values`   | `number`                | Maximum selections (select menus only)         | No       |
| `permissions`  | `PermissionFlagsBits[]` | Required permissions to use the component      | No       |
| `multi_select` | `boolean`               | Enable multiple selections (select menus only) | No       |

### Build Method

The `build` method creates the component instance with its configuration. **All build options are now optional.**

```typescript
async build(client: Client, options?: BuildOptionsType) {
    // Create and configure component
    return component;
}
```

- You may omit the `options` argument if you do not need to pass any dynamic data.
- The `data` property inside options is also optional.

### Execute Method

The `execute` method handles component interactions:

```typescript
async execute(interaction: ComponentInteraction, client: Client, ...args) {
    // Handle interaction
}
```

## Persistent Component Data

Components can store persistent data in their custom IDs using the client's `getCustomID` function. This allows components to maintain state between interactions without requiring database storage.

### Custom ID Format

Components use a structured custom ID format to organize and group related components. The format supports parent and group identifiers:

```typescript
// Format: parent:group:componentId
// Examples:
'config:roles:edit'; // Basic format
'config:edit'; // Without group
'edit'; // Minimal format
```

### ID Structure Hierarchy

The custom ID format follows a hierarchical structure:

| Part          | Description                     | Example                                          |
| ------------- | ------------------------------- | ------------------------------------------------ |
| `parent`      | The parent command or flow      | `roles` (for role management)                    |
| `group`       | The message template or view    | `config-main-menu` (for role configuration menu) |
| `componentId` | The specific component's action | `edit` (for edit button)                         |

Example breakdown:

```typescript
'roles:config-main-menu:edit';
// parent: roles (role management system)
// group: config-main-menu (main configuration view)
// componentId: edit (edit button)
```

### Flow Interaction Handling

The parent and group identifiers are particularly useful for handling interactions within flows. They help organize and route interactions to the correct handlers:

```typescript
// Example from RoleConfigFlow
protected async handleInteraction(
    interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction,
    client: Client,
    state: FlowState
): Promise<FlowTransition | void> {
    // Early return if not in a guild context
    if (!interaction.guild) return;

    // Parse the custom ID to get component identifiers and data
    // Example: "roles:config-main-menu:edit[compressedData]" becomes:
    // { id: 'edit', parent: 'roles', group: 'config-main-menu', data: {...} }
    const { id, parent, group, data } = parseData(interaction.customId);

    // Handle different interaction types
    if (interaction instanceof ButtonInteraction) {
        // Route based on the group (current view)
        switch (group) {
            case 'config-main-menu':
                // Handle main menu button interactions
                switch (id) {
                    case 'edit':
                        // Transition to category selection view
                        return {
                            to: 'category-select'
                        }
                    case 'create':
                        // Transition to category name input with create action
                        return {
                            to: 'category-name-input',
                            data: {
                                action: 'create'
                            }
                        }
                }
            case 'category-edit':
                // Handle category edit view button interactions
                switch (id) {
                    case 'name':
                        // Transition to name input with edit action and category data
                        return {
                            to: 'category-name-input',
                            data: {
                                action: 'edit',
                                category: data?.category
                            }
                        }
                }
        }
    }
}
```

This structure allows for:

- Clear organization of related components
- Easy routing of interactions to the correct flow handlers
- Consistent handling of component interactions across different views
- Simplified flow state management

### Supported Formats

1. `parent:componentId` - Parent without data
2. `componentId` - Basic without data
3. `parent:group:componentId` - Full format without data

### Basic Usage

```typescript
/**
 * @param id - Component ID or full path (e.g., 'config:roles:edit')
 * @param data - Data to be compressed and stored in the custom ID
 * @returns Formatted custom ID string with compressed data
 */

// Example with complex data structure:
const testJSON = {
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

const button_id = await client.getCustomID('test-button', testJSON);
// Returns: "test-button[compressedData]"

// Example with simple data:
const simpleData = {
	boolean: true,
	number: 1,
	string: 'test',
	array: [1, 2, 3],
};

const simple_id = await client.getCustomID('test-button', simpleData);
// Returns: "test-button[compressedData]"
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
import { ButtonComponent } from '@/core/classes/ButtonComponent';
import type { Client } from '@/core/client/BerryClient';
import * as discord from 'discord.js';

class ExampleButton extends ButtonComponent<{ count?: number }> {
	id = 'example-button';
	label = 'Click Me';
	style = discord.ButtonStyle.Primary;

	async build(client: Client, data?: { count?: number }) {
		// Store data in custom ID
		return await super.build(client, data);
	}

	async execute(
		interaction: discord.ButtonInteraction,
		client: Client,
		data?: { count?: number }
	) {
		// Access stored data
		const { count } = data || {};
		// Handle interaction
	}
}

export default ExampleButton;
```

## Directory Structure

```
src/
└── components/
    ├── buttons/         # Button Components
    ├── modals/          # Modals
    └── selectMenus/     # Select Menus
```

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
