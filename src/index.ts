import { ShardingManager } from 'discord.js';
import { config } from './config';
export * as util from './util';
export * as handlers from './handlers';
export * as interfaces from './interfaces';
export * as messages from './messages';

const manager: ShardingManager = new ShardingManager(__dirname + '/bot.js', {
    token: config.token
});

manager.on('shardCreate', shard => {
    shard.on('spawn', () => {
        console.log(
            `${
                new Date().getMonth() + 1
            }.${new Date().getDate()}.${new Date().getFullYear()} > ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getMinutes()} > SHARD MANAGER > Shard ${
                shard.id
            } connected to Discord's Gateway.`
        );
        shard.send({ type: 'shardId', data: { shardId: shard.id } });
    });
});

manager
    .spawn()
    .catch(_e =>
        console.log(
            `${
                new Date().getMonth() + 1
            }.${new Date().getDate()}.${new Date().getFullYear()} > ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getMinutes()} > SHARD MANAGER > Shard failed to spawn.`
        )
    );
