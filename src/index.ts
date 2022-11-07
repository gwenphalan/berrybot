import { ShardingManager } from 'discord.js';
import { config } from '../config';

const manager: ShardingManager = new ShardingManager('./dist/src/bot.js', {
    token: config.token
});
manager.on('shardCreate', shard => {
    // Listeing for the ready event on shard.
    shard.on('spawn', () => {
        console.log(
            `${
                new Date().getMonth() + 1
            }.${new Date().getDate()}.${new Date().getFullYear()} > ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getMinutes()} > SHARD MANAGER > Shard ${
                shard.id
            } connected to Discord's Gateway.`
        );
        // Sending the data to the shard.
        shard.send({ type: 'shardId', data: { shardId: shard.id } });
    });
});

manager.spawn().catch(_e => console.error(`[ERROR/SHARD] Shard failed to spawn.`));
