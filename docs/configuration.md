# BerryBot Configuration System Documentation

## Table of Contents

- [BerryBot Configuration System Documentation](#berrybot-configuration-system-documentation)
    - [Table of Contents](#table-of-contents)
    - [Overview](#overview)
    - [Setting Up Environment](#setting-up-environment)
        - [Creating .env File](#creating-env-file)
        - [File Location](#file-location)
        - [Environment Setup](#environment-setup)
    - [Environment Variables](#environment-variables)
        - [Required Variables](#required-variables)
        - [Optional Variables](#optional-variables)
        - [Development Variables](#development-variables)
    - [Configuration Structure](#configuration-structure)
        - [Type Safety](#type-safety)
        - [Default Values](#default-values)
        - [Validation](#validation)
    - [Adding New Configuration](#adding-new-configuration)
        - [1. Environment Variable](#1-environment-variable)
        - [2. Type Definition](#2-type-definition)
        - [3. Add to Config Object](#3-add-to-config-object)
        - [4. Validation](#4-validation)
    - [Usage Examples](#usage-examples)
        - [Accessing Configuration](#accessing-configuration)
        - [Type-Safe Access](#type-safe-access)
        - [Error Handling](#error-handling)
    - [Best Practices](#best-practices)
    - [Common Issues](#common-issues)

## Overview

BerryBot's configuration system provides a type-safe and centralized way to manage bot settings. The system features:

- **Type Safety**: Full TypeScript support with proper interfaces
- **Environment Variables**: Support for `.env` file and process environment
- **Validation**: Runtime validation of configuration values
- **Default Values**: Sensible defaults for optional settings
- **Development Mode**: Special handling for development environment

The configuration system is designed to be:

- **Maintainable**: Clear structure and organization
- **Extensible**: Easy to add new configuration options
- **Secure**: Proper handling of sensitive data
- **Developer-Friendly**: Type hints and validation

## Setting Up Environment

### Creating .env File

1. Create a new file named `.env` in the root directory of your project
2. Copy the contents from `.env.example` if available, or create it from scratch
3. Fill in the required values for your environment

Example `.env` file:

```env
# Discord Bot Token (Required)
DISCORD_TOKEN=your_discord_bot_token

# MongoDB Connection (Required)
MONGO_STRING=your_mongodb_connection_string
DATABASE_NAME=your_database_name

# Developer ID (Required)
DEVELOPER_ID=your_discord_user_id

# Environment (Optional)
NODE_ENV=development
LOG_LEVEL=info

# Development Settings (Optional)
DEV_SERVER_ID=your_test_server_id
DEBUG=true
```

### File Location

The `.env` file should be placed in the root directory of your project:

```
berrybot/
├── .env                  # Environment variables
├── src/
├── docs/
├── package.json
└── ...
```

### Environment Setup

1. **Development Environment**

    - Create `.env` file in project root
    - Set `NODE_ENV=development`
    - Enable debug mode if needed
    - Add development server ID

2. **Production Environment**

    - Set `NODE_ENV=production`
    - Disable debug mode
    - Use production API keys
    - Set appropriate log level

3. **Security Notes**
    - Never commit `.env` to version control
    - Add `.env` to `.gitignore`
    - Keep a `.env.example` file in version control
    - Use strong, unique values for secrets

## Environment Variables

### Required Variables

These variables must be set for the bot to function:

```env
# Discord Bot Token
DISCORD_TOKEN=your_discord_bot_token

# MongoDB Connection
MONGO_STRING=your_mongodb_connection_string
DATABASE_NAME=your_database_name

# Developer ID for private commands
DEVELOPER_ID=your_discord_user_id
```

### Optional Variables

These variables have default values but can be overridden:

```env
# Environment (development | production)
NODE_ENV=development

# Logging Level (debug | info | warn | error)
LOG_LEVEL=info

# API Keys (if needed)
API_KEY=your_api_key
```

### Development Variables

These variables are only used in development:

```env
# Development Server
DEV_SERVER_ID=your_test_server_id

# Debug Mode
DEBUG=true
```

## Configuration Structure

### Type Safety

The configuration is fully typed using TypeScript interfaces:

```typescript
export interface Config {
	/** Discord bot token used for authentication */
	token: string;
	/** Optional developer user ID for special permissions */
	developer?: string;
	/** Name of the MongoDB database to use */
	database_name: string;
	/** MongoDB connection string */
	mongo_string: string;
}
```

### Default Values

Default values are provided for optional settings:

```typescript
export const config: Config = {
	token: process.env.DISCORD_TOKEN,
	mongo_string: process.env.MONGO_STRING,
	developer: process.env.DEVELOPER_ID,
	database_name: process.env.DATABASE_NAME || 'development',
};
```

### Validation

Configuration values are validated at startup:

```typescript
if (!process.env.DISCORD_TOKEN) {
	throw new Error('No Discord bot token provided.');
} else if (!process.env.MONGO_STRING) {
	throw new Error('No MongoDB connection string provided.');
} else if (!process.env.DATABASE_NAME) {
	logger.info('No database name provided. Defaulting to "development".');
}
```

## Adding New Configuration

### 1. Environment Variable

Add your new variable to the `.env` file:

```env
NEW_CONFIG=value
```

### 2. Type Definition

Add the type to the `Config` interface in `src/config/index.ts`:

```typescript
export interface Config {
	// ... existing config
	/** Description of the new config */
	new_config: string;
}
```

### 3. Add to Config Object

Add the new config to the config object in `src/config/index.ts`:

```typescript
export const config: Config = {
	// ... existing config
	new_config: process.env.NEW_CONFIG || 'default_value',
};
```

### 4. Validation

Add validation in `src/config/index.ts`:

```typescript
// Add validation with other checks
if (!process.env.NEW_CONFIG) {
	logger.info('No new config provided. Using default value.');
}
```

## Usage Examples

### Accessing Configuration

The configuration is accessible in two ways:

1. **Direct Import**

```typescript
import { config } from '../config';

// Access values
const token = config.token;
const dbName = config.database_name;
```

2. **Through Client Object**

```typescript
// In a command or event handler
async function handleCommand(interaction: CommandInteraction, client: Client) {
	// Access config through client
	const token = client.config.token;
	const dbName = client.config.database_name;

	// Check if developer
	if (interaction.user.id === client.config.developer) {
		// Handle developer-only functionality
	}
}
```

### Type-Safe Access

TypeScript provides type hints and validation:

```typescript
// TypeScript knows the types
const token: string = config.token;
const developer: string | undefined = config.developer;

// Optional values are properly typed
if (config.developer) {
	// TypeScript knows developer is defined here
	handleDeveloperAction(config.developer);
}
```

### Error Handling

Handle missing or invalid configuration:

```typescript
try {
	// Access config
	const token = config.token;
} catch (error) {
	logger.error('Configuration error:', error);
	process.exit(1);
}
```

## Best Practices

1. **Environment Variables**

    - Use `.env` file for local development
    - Never commit `.env` to version control
    - Use descriptive variable names
    - Document all variables

2. **Type Safety**

    - Always define types for new config
    - Use strict type checking
    - Handle optional values properly
    - Use type guards when needed

3. **Validation**

    - Validate all required fields
    - Check value types and ranges
    - Provide meaningful error messages
    - Handle edge cases

4. **Security**

    - Never log sensitive values
    - Use environment variables for secrets
    - Validate input carefully
    - Follow security best practices

5. **Development**
    - Use development defaults
    - Enable debug mode in development
    - Document configuration changes
    - Test configuration changes

## Common Issues

1. **Missing Variables**

    - Check `.env` file exists
    - Verify variable names
    - Check for typos
    - Ensure required variables are set

2. **Type Errors**

    - Check type definitions
    - Verify value types
    - Use type guards
    - Handle optional values

3. **Validation Errors**

    - Check value formats
    - Verify value ranges
    - Handle edge cases
    - Provide clear error messages

4. **Environment Issues**
    - Check NODE_ENV setting
    - Verify development mode
    - Check debug settings
    - Validate environment setup
