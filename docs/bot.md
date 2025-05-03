# BerryBot Core

This document provides an overview of the core bot initialization and sharding system in BerryBot.

## Table of Contents

- [Bot Initialization](#bot-initialization)
- [Sharding System](#sharding-system)
- [Gateway Intents](#gateway-intents)
- [Partial Structures](#partial-structures)
- [Error Handling](#error-handling)

## Bot Initialization

The bot is initialized in two main files:

- `src/bot.ts`: Bot instance and client setup
- `src/index.ts`: Sharding manager and process management

### Bot Instance (`bot.ts`)

The bot instance is created with specific Discord.js configurations:

```typescript
const client = new Client({
	intents: [Guilds, GuildMembers, GuildMessages, GuildMessageReactions],
	partials: [User, Message, GuildMember, ThreadMember, Reaction],
});
```

#### Required Intents

- `Guilds`: Access to guild information
- `GuildMembers`: Access to guild member information
- `GuildMessages`: Access to guild messages
- `GuildMessageReactions`: Access to message reactions

#### Required Partials

- `User`: Partial user data
- `Message`: Partial message data
- `GuildMember`: Partial guild member data
- `ThreadMember`: Partial thread member data
- `Reaction`: Partial reaction data

### Sharding Manager (`index.ts`)

The sharding manager handles multiple bot instances for large-scale deployments:

```typescript
const manager = new ShardingManager(__dirname + '/bot.js', {
	token: config.token,
});
```

## Sharding System

### Shard Lifecycle

1. **Creation**

    ```typescript
    manager.on('shardCreate', (shard) => {
    	logger.info(`Shard ${shard.id} created`);
    });
    ```

2. **Spawn**

    ```typescript
    shard.on('spawn', () => {
    	// Shard connected to Discord's Gateway
    	shard.send({ type: 'shardId', data: { shardId: shard.id } });
    });
    ```

3. **Error Handling**

    ```typescript
    shard.on('error', (error) => {
    	logger.error({ error, shardId: shard.id }, 'Shard encountered an error');
    });
    ```

4. **Disconnection**

    ```typescript
    shard.on('disconnect', () => {
    	logger.warn({ shardId: shard.id }, 'Shard disconnected from Discord');
    });
    ```

5. **Reconnection**
    ```typescript
    shard.on('reconnecting', () => {
    	logger.info({ shardId: shard.id }, 'Shard attempting to reconnect');
    });
    ```

### IPC Communication

The bot uses IPC (Inter-Process Communication) to handle shard management:

```typescript
process.on('message', (message: { type: string; data?: { shardId: number } }) => {
	if (message.type === 'shardId') {
		shardId = message.data?.shardId ?? null;
	}
});
```

## Gateway Intents

### Required Intents

1. **Guilds**

    - Access to guild information
    - Required for basic bot functionality

2. **GuildMembers**

    - Access to guild member information
    - Required for member-related commands

3. **GuildMessages**

    - Access to guild messages
    - Required for message handling

4. **GuildMessageReactions**
    - Access to message reactions
    - Required for reaction handling

## Partial Structures

### Required Partials

1. **User**

    - Partial user data
    - Used for user-related operations

2. **Message**

    - Partial message data
    - Used for message handling

3. **GuildMember**

    - Partial guild member data
    - Used for member-related operations

4. **ThreadMember**

    - Partial thread member data
    - Used for thread operations

5. **Reaction**
    - Partial reaction data
    - Used for reaction handling

## Error Handling

### Bot Initialization Errors

```typescript
client.init().catch((error) => {
	logger.error({ error, shardId }, 'Failed to initialize bot');
	process.exit(1);
});
```

### Shard Spawn Errors

```typescript
manager.spawn().catch((error) => {
	logger.error({ error }, 'Failed to spawn shard');
	process.exit(1);
});
```

### Shard Communication Errors

```typescript
shard.send({ type: 'shardId', data: { shardId: shard.id } }).catch((error) => {
	logger.error({ error, shardId: shard.id }, 'Failed to send shard ID to bot process');
});
```

## Best Practices

1. **Shard Management**

    - Monitor shard health
    - Handle shard errors gracefully
    - Implement proper reconnection logic
    - Use appropriate shard count

2. **Error Handling**

    - Log all errors with context
    - Implement proper error recovery
    - Handle process exits gracefully
    - Monitor error rates

3. **Resource Management**

    - Monitor memory usage
    - Handle process cleanup
    - Implement proper logging
    - Manage connection limits

4. **Performance**
    - Use appropriate intents
    - Implement caching strategies
    - Monitor API rate limits
    - Optimize resource usage

## Common Issues

1. **Shard Issues**

    - Shard disconnections
    - Memory leaks
    - Rate limiting
    - IPC failures

2. **Initialization Issues**

    - Missing intents
    - Invalid token
    - Permission issues
    - Connection failures

3. **Resource Issues**

    - High memory usage
    - CPU spikes
    - Network congestion
    - File descriptor limits

4. **API Issues**
    - Rate limiting
    - Gateway disconnections
    - Invalid responses
    - Timeout errors
