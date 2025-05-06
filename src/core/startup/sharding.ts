import { ShardingManager, Shard } from 'discord.js';
import { config } from '@/core/config/config';
import { logger } from '@/core/logging/Logger';

// NOTE: Ensure @types/node is installed and tsconfig.json includes "types": ["node"] for Node.js globals like __dirname and process.

// Initialize sharding manager with bot entry point
logger.info('Initializing sharding manager');
const manager: ShardingManager = new ShardingManager(__dirname + '/bot.js', {
	token: config.token,
});

// Handle shard creation and connection events
manager.on('shardCreate', (shard: Shard) => {
	logger.info(`Shard ${shard.id} created`);

	// When a shard spawns and connects to Discord
	shard.on('spawn', () => {
		const timestamp = new Date().toISOString();
		logger.info({
			timestamp,
			shardId: shard.id,
			event: 'SHARD_MANAGER',
			message: "Shard connected to Discord's Gateway",
		});

		// Send shard ID to the bot process for identification
		shard.send({ type: 'shardId', data: { shardId: shard.id } }).catch((error: Error) => {
			logger.error(
				{
					error,
					shardId: shard.id,
				},
				'Failed to send shard ID to bot process'
			);
		});
	});

	// Handle shard errors
	shard.on('error', (error: Error) => {
		logger.error(
			{
				error,
				shardId: shard.id,
			},
			'Shard encountered an error'
		);
	});

	// Handle shard disconnection
	shard.on('disconnect', () => {
		logger.warn(
			{
				shardId: shard.id,
			},
			'Shard disconnected from Discord'
		);
	});

	// Handle shard reconnection
	shard.on('reconnecting', () => {
		logger.info(
			{
				shardId: shard.id,
			},
			'Shard attempting to reconnect'
		);
	});
});

// Spawn shards and handle any spawn failures
logger.info('Spawning shards');
manager.spawn().catch((error: Error) => {
	logger.error(
		{
			error,
		},
		'Failed to spawn shard'
	);
	process.exit(1);
});
