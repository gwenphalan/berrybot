# BerryBot Database System Documentation

## Table of Contents

- [BerryBot Database System Documentation](#berrybot-database-system-documentation)
    - [Table of Contents](#table-of-contents)
    - [Overview](#overview)
    - [Database Structure](#database-structure)
        - [Connection Management](#connection-management)
        - [Schema Definition](#schema-definition)
        - [Model Management](#model-management)
    - [Adding Schemas to Database Index](#adding-schemas-to-database-index)
    - [Creating New Schemas](#creating-new-schemas)
        - [1. Basic Schema Structure](#1-basic-schema-structure)
        - [2. Schema Types](#2-schema-types)
        - [3. Schema Validation](#3-schema-validation)
        - [4. Schema Methods](#4-schema-methods)
    - [Database Operations](#database-operations)
        - [1. Querying Data](#1-querying-data)
        - [2. Updating Data](#2-updating-data)
        - [3. Error Handling](#3-error-handling)
    - [Accessing the Database from Client](#accessing-the-database-from-client)
        - [1. Client Interface](#1-client-interface)
        - [2. Usage Examples](#2-usage-examples)
            - [Accessing Guild Settings](#accessing-guild-settings)
            - [Creating New Documents](#creating-new-documents)
            - [Querying Data](#querying-data)
            - [Error Handling](#error-handling)
        - [3. Best Practices](#3-best-practices)
    - [Example Implementation](#example-implementation)
    - [Common Issues](#common-issues)

## Overview

BerryBot's database system is built on MongoDB with Mongoose, providing a structured and type-safe way to manage data. The system features:

- **Type Safety**: Full TypeScript support with proper interfaces
- **Schema Validation**: Built-in data validation
- **Connection Management**: Automatic connection handling
- **Error Handling**: Comprehensive error management
- **Logging**: Detailed operation logging
- **Model Management**: Centralized model access

The database system is designed to be:

- **Maintainable**: Clear structure and organization
- **Extensible**: Easy to add new schemas
- **Reliable**: Robust error handling
- **Performant**: Efficient data operations

## Database Structure

### Connection Management

The database connection is managed in `src/database/index.ts`:

```typescript
import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../util';

// Connect to MongoDB
mongoose.connect(config.mongo_string, {
	dbName: config.database_name,
});

// Get connection instance
const db = mongoose.connection;

// Handle connection events
db.on('error', (err) => {
	logger.error({ error: err }, 'MongoDB connection error');
});

db.once('open', () => {
	logger.info(`Connected to MongoDB Atlas at ${db.name}`);
});
```

### Schema Definition

Schemas are defined using Mongoose schemas with TypeScript interfaces:

```typescript
import mongoose from 'mongoose';

// Interface for document
export interface MyDocument extends mongoose.Document {
	field1: string;
	field2: number;
}

// Mongoose schema
const MySchema = new mongoose.Schema({
	field1: String,
	field2: Number,
});

// Export model
export const MyModel = mongoose.model<MyDocument>('MyModel', MySchema);
```

### Model Management

Models are managed through a centralized interface:

```typescript
export const database = {
	myModel: {
		get: async (id: string) => {
			return await MyModel.findOne({ _id: id });
		},
		update: async (id: string, data: Partial<MyDocument>) => {
			await MyModel.updateOne({ _id: id }, data);
		},
		model: MyModel,
	},
	// Add new models here
};
```

## Adding Schemas to Database Index

To add a new schema to the database system, you need to:

1. **Create the Schema File**
   First, create your schema file in `src/database/schemas/` as described in the [Creating New Schemas](#creating-new-schemas) section.

2. **Import the Schema**
   Add the import to `src/database/index.ts`:

```typescript
import { ExampleModel } from './schemas/Example';
```

3. **Create Schema Management Object**
   Create a new object for your schema with its management functions:

```typescript
/**
 * Example model management
 * Provides methods to get and update example documents
 */
export const example = {
	/**
	 * Get example document, creating default document if none exist
	 * @param document_id - The ID of the document to get
	 * @returns Promise resolving to the document
	 */
	get: async (document_id: string) => {
		logger.debug(`Fetching document: ${document_id}`);
		const doc = await ExampleModel.findOne({ document_id: document_id });

		if (doc) {
			logger.debug(`Found existing document: ${document_id}`);
			return doc;
		}

		logger.debug(`Creating default document: ${document_id}`);
		return await ExampleModel.create({
			document_id: document_id,
			// Add any default values here
		});
	},

	/**
	 * Update example document
	 * @param document_id - The ID of the document to update
	 * @param data - The new data to apply
	 */
	async update(document_id: string, data: ExampleModel) {
		logger.debug(`Updating document: ${document_id}`);
		await ExampleModel.updateOne({ document_id: document_id }, data);
		logger.debug(`Document updated: ${document_id}`);
	},

	/** Mongoose model for direct access */
	model: ExampleModel,
};
```

4. **Add to Database Export**
   Add your schema management object to the database interface:

```typescript
/**
 * Database interface
 * Exports all database models and their management functions
 */
export const database = {
	guildSettings,
	example,
	// Add new models here
};
```

## Creating New Schemas

### 1. Basic Schema Structure

Create a new file in `src/database/schemas/` with the following structure:

```typescript
import mongoose from 'mongoose';

// 1. Define the document interface
export interface MyDocument extends mongoose.Document {
	// Document fields
	field1: string;
	field2: number;
	// Optional fields
	field3?: boolean;
}

// 2. Define the schema
const MySchema = new mongoose.Schema({
	field1: {
		type: String,
		required: true,
	},
	field2: {
		type: Number,
		default: 0,
	},
	field3: {
		type: Boolean,
		default: false,
	},
});

// 3. Export the model
export const MyModel = mongoose.model<MyDocument>('MyModel', MySchema);
```

### 2. Schema Types

Mongoose supports various field types:

```typescript
const MySchema = new mongoose.Schema({
	// Basic types
	string: String,
	number: Number,
	boolean: Boolean,
	date: Date,

	// Complex types
	array: [String],
	object: {
		field1: String,
		field2: Number,
	},

	// Special types
	mixed: mongoose.Schema.Types.Mixed,
	objectId: mongoose.Schema.Types.ObjectId,
});
```

### 3. Schema Validation

Add validation to your schema:

```typescript
const MySchema = new mongoose.Schema({
	field1: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 50,
	},
	field2: {
		type: Number,
		min: 0,
		max: 100,
	},
	field3: {
		type: String,
		enum: ['option1', 'option2', 'option3'],
	},
});
```

### 4. Schema Methods

Add custom methods to your schema:

```typescript
// Instance methods
MySchema.methods.myMethod = function () {
	return this.field1 + this.field2;
};

// Static methods
MySchema.statics.findByField = function (field: string) {
	return this.find({ field1: field });
};

// Virtual properties
MySchema.virtual('fullName').get(function () {
	return `${this.firstName} ${this.lastName}`;
});
```

## Database Operations

### 1. Querying Data

Common query operations:

```typescript
// Find one document
const doc = await MyModel.findOne({ field1: 'value' });

// Find multiple documents
const docs = await MyModel.find({ field2: { $gt: 10 } });

// Find with options
const docs = await MyModel.find().sort({ field1: 1 }).limit(10).skip(0);
```

### 2. Updating Data

Common update operations:

```typescript
// Update one document
await MyModel.updateOne({ _id: id }, { $set: { field1: 'new value' } });

// Update multiple documents
await MyModel.updateMany({ field2: { $lt: 10 } }, { $inc: { field2: 1 } });
```

### 3. Error Handling

Proper error handling in database operations:

```typescript
try {
	const result = await MyModel.findOne({ _id: id });
	if (!result) {
		throw new Error('Document not found');
	}
	return result;
} catch (error) {
	logger.error({ error }, 'Database operation failed');
	throw error;
}
```

## Accessing the Database from Client

The database is accessible through the client object, providing a centralized way to interact with all database models.

### 1. Client Interface

The client interface includes the database:

```typescript
import { database } from '../database';

export interface Client extends Discord.Client {
	// ... other client properties
	database: typeof database;
}
```

### 2. Usage Examples

#### Accessing Guild Settings

```typescript
// In a command or event handler
async function handleCommand(interaction: CommandInteraction, client: Client) {
	// Get guild settings
	const settings = await client.database.guildSettings.get(interaction.guildId);

	// Update settings
	await client.database.guildSettings.update(interaction.guildId, {
		selfRoles: {
			categories: [
				{
					name: 'New Category',
					roles: ['role1', 'role2'],
					emoji: '🎮',
				},
			],
		},
	});
}
```

#### Creating New Documents

```typescript
// Create a new document
const newDoc = await client.database.myModel.create({
	field1: 'value1',
	field2: 42,
});
```

#### Querying Data

```typescript
// Find documents
const docs = await client.database.myModel.model.find({
	field1: 'value1',
});
```

#### Error Handling

```typescript
try {
	const settings = await client.database.guildSettings.get(guildId);
	if (!settings) {
		throw new Error('Guild settings not found');
	}
	// Use settings...
} catch (error) {
	logger.error({ error }, 'Error accessing database');
	// Handle error...
}
```

### 3. Best Practices

1. **Schema Design**

    - Use appropriate field types
    - Implement proper validation
    - Define required fields
    - Use default values when appropriate

2. **Type Safety**

    - Define TypeScript interfaces
    - Use proper type annotations
    - Validate data types
    - Handle optional fields

3. **Error Handling**

    - Implement try-catch blocks
    - Log errors with context
    - Handle edge cases
    - Provide meaningful error messages

4. **Performance**

    - Use appropriate indexes
    - Implement pagination
    - Cache frequently accessed data
    - Optimize queries

5. **Security**

    - Validate user input
    - Sanitize data
    - Implement access control
    - Handle sensitive data

6. **Client Database Usage**

    - Access database through `client.database`
    - Don't import database directly in commands/events
    - Use the provided model management functions
    - Always wrap database operations in try-catch
    - Log errors with appropriate context
    - Handle null/undefined results

7. **State Management**
    - Cache frequently accessed data
    - Use appropriate query methods
    - Implement pagination for large datasets
    - Validate data before database operations
    - Check permissions before accessing data
    - Sanitize data before saving

## Example Implementation

Here's a complete example of a guild settings schema:

```typescript
import { Role } from 'discord.js';
import mongoose from 'mongoose';

// Document interface
export interface GuildSettings extends mongoose.Document {
	guild: string;
	selfRoles: {
		message?: string;
		categories: SelfRoleCategory[];
		channel?: string;
	};
}

// Nested interface
export interface SelfRoleCategory {
	name: string;
	roles: Role['id'][];
	emoji: string;
}

// Schema definition
const GuildSettingsSchema = new mongoose.Schema({
	guild: String,
	selfRoles: {
		categories: [
			{
				name: String,
				roles: [String],
				emoji: String,
			},
		],
		message: String,
		channel: String,
	},
});

// Export model
export const GuildSettings = mongoose.model<GuildSettings>('GuildSettings', GuildSettingsSchema);
```

## Common Issues

1. **Connection Problems**

    - Check MongoDB connection string
    - Verify network connectivity
    - Check authentication credentials
    - Monitor connection pool

2. **Schema Validation**

    - Verify required fields
    - Check field types
    - Validate data before saving
    - Handle validation errors

3. **Performance Issues**

    - Monitor query performance
    - Use appropriate indexes
    - Implement caching
    - Optimize data structure

4. **Type Errors**
    - Check interface definitions
    - Verify type annotations
    - Handle optional fields
    - Use type guards
