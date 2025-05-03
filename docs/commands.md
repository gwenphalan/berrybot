# BerryBot Command System Documentation

## Table of Contents

- [BerryBot Command System Documentation](#berrybot-command-system-documentation)
    - [Table of Contents](#table-of-contents)
    - [Overview](#overview)
    - [Command Structure](#command-structure)
        - [Basic Command Template](#basic-command-template)
        - [Command Properties](#command-properties)
    - [Command Types](#command-types)
        - [1. Main Commands](#1-main-commands)
        - [2. Subcommands](#2-subcommands)
    - [Command Features](#command-features)
        - [1. Guild-Only Commands](#1-guild-only-commands)
        - [2. Developer-Only Commands](#2-developer-only-commands)
        - [3. Permission Requirements](#3-permission-requirements)
    - [Best Practices](#best-practices)
    - [Command Registration](#command-registration)
    - [Directory Structure](#directory-structure)
    - [Common Issues](#common-issues)

## Overview

BerryBot's command system is built on Discord's slash command framework, providing a structured and type-safe way to create and manage bot commands. The system supports both standalone commands and command groups with subcommands, offering features like:

- **Type Safety**: Full TypeScript support with proper interfaces and type checking
- **Command Organization**: Clear separation between public and private commands
- **Permission Management**: Built-in support for guild-only and developer-only commands
- **Error Handling**: Comprehensive error handling and logging system
- **Command Registration**: Automatic command registration and validation
- **Subcommand Support**: Hierarchical command structure with subcommands
- **Permission Requirements**: Fine-grained permission control for commands

The command system is designed to be:

- **Maintainable**: Clear structure and organization
- **Extensible**: Easy to add new commands and features
- **Secure**: Built-in permission checks and validation
- **User-Friendly**: Proper error messages and feedback

## Command Structure

### Basic Command Template

```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../interfaces';
import { logger } from '../util/Logger';

const command: Command = {
	data: new SlashCommandBuilder().setName('command-name').setDescription('Command description'),
	async execute(interaction: ChatInputCommandInteraction, client) {
		// Command logic here
	},
};

module.exports = command;
```

### Command Properties

| Property    | Type                  | Description                          | Required |
| ----------- | --------------------- | ------------------------------------ | -------- |
| `data`      | `SlashCommandBuilder` | Command definition and options       | Yes      |
| `execute`   | `Function`            | Command execution handler            | Yes      |
| `parent`    | `string`              | Parent command name for subcommands  | No       |
| `developer` | `boolean`             | Restricts command to developers only | No       |
| `guildOnly` | `boolean`             | Restricts command to guild context   | No       |

## Command Types

### 1. Main Commands

Main commands are standalone slash commands that don't have subcommands.

Example:

```typescript
const command: Command = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply('Pong!');
	},
};
```

### 2. Subcommands

Subcommands are grouped under a parent command and share common functionality.

Example:

```typescript
const command: Command = {
	parent: 'test',
	data: new SlashCommandSubcommandBuilder()
		.setName('subcommand')
		.setDescription('Subcommand description'),
	async execute(interaction: ChatInputCommandInteraction, client) {
		// Subcommand logic
	},
};
```

## Command Features

### 1. Guild-Only Commands

To restrict a command to guild contexts only:

```typescript
const command: Command = {
    guildOnly: true,
    data: new SlashCommandBuilder()...
    async execute(interaction, client) {
        if (!interaction.guild) {
            return interaction.reply({
                content: 'This command can only be used in a server.',
                ephemeral: true
            });
        }
        // Command logic
    }
};
```

### 2. Developer-Only Commands

To restrict a command to developers only:

```typescript
const command: Command = {
    developer: true,
    data: new SlashCommandBuilder()...
};
```

### 3. Permission Requirements

To set required permissions for a command:

```typescript
const command: Command = {
	data: new SlashCommandBuilder()
		.setName('command')
		.setDescription('Description')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	// ...
};
```

## Best Practices

1. **Error Handling**

    - Always implement proper error handling in your commands
    - Use try-catch blocks for async operations
    - Provide meaningful error messages to users
    - Use the logger utility for debugging:

    ```typescript
    import { logger } from '../util/Logger';
    logger.debug({ data }, 'Debug message');
    logger.error({ error }, 'Error message');
    ```

2. **Guild Context**

    - Check for guild context when required
    - Provide clear feedback when commands are used outside guilds
    - Use the `guildOnly` property when appropriate

3. **Ephemeral Messages**

    - Use ephemeral messages for responses that should only be visible to the command user
    - Set `ephemeral: true` in interaction replies when appropriate

4. **Command Organization**

    - Place public commands in `src/commands/Public/`
    - Place private/developer commands in `src/commands/Private/`
    - Group related commands in subdirectories
    - Use clear, descriptive names for commands and subcommands
    - Document command functionality with comments

5. **Performance**
    - Keep command execution time minimal
    - Use appropriate caching mechanisms when needed
    - Handle rate limits appropriately
    - Use deferred replies for longer operations:
    ```typescript
    await interaction.deferReply({ ephemeral: true });
    // Do work
    await interaction.editReply({ content: 'Done!' });
    ```

## Command Registration

Commands are automatically registered by the `CommandHandler`. The handler:

1. Loads all command files from the commands directory
2. Validates command structure
3. Registers commands with Discord's API
4. Attaches subcommands to their parent commands

## Directory Structure

```
src/
└── commands/
    ├── Public/        # Public commands
    └── Private/       # Private/developer commands
```

## Common Issues

1. **Command Not Registering**

    - Check command structure and required properties
    - Verify command name is unique
    - Ensure proper export of command object
    - Check for TypeScript compilation errors

2. **Permission Issues**

    - Verify bot has required permissions
    - Check command permission settings
    - Validate user permissions
    - Use `setDefaultMemberPermissions()` appropriately

3. **Database Issues**
    - Verify MongoDB connection string
    - Check database permissions
    - Ensure proper schema structure
    - Validate data types
