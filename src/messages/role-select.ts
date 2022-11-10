import * as discord from 'discord.js';
import { ButtonBuilder } from 'discord.js';
import { util } from '..';
import { Client, MessageBuilder } from '../interfaces';
import RoleCategory from '../components/buttons/role-category';

export const RoleSelect: MessageBuilder = {
    embeds: [new discord.EmbedBuilder().setTitle('Example').setDescription('Choose a category to view and select the roles you want to add.')],
    components: [],
    async build(client, guild: discord.Guild) {
        this.embeds[0]
            .setColor(await util.Color.getGuildColor(guild, true))
            .setTitle(`${guild.name}'s Self Roles`)
            .setDescription(`Choose a category to view and select the roles you want to add.`)
            .setThumbnail(guild.iconURL({ extension: 'png', size: 256 }) || '');

        const rows = [];
        const guildSettings = await client.database.guildSettings.get(guild.id);

        let row = new discord.ActionRowBuilder<ButtonBuilder>();

        for (const category of guildSettings.selfRoles.categories) {
            console.log(category);
            if (row.components.length >= 5) {
                rows.push(row);
                row = new discord.ActionRowBuilder();
            }

            const button = await RoleCategory.build(client, 'assign', category.name, guild.id);
            if (category.emoji) button.setEmoji(category.emoji);
            row.addComponents(button);
        }

        rows.push(row);

        this.components = rows;

        console.log(rows);

        return {
            embeds: this.embeds,
            components: rows
        };
    }
};

export async function RoleMessage(client: Client, guild: discord.Guild, channel?: string) {
    const database = await client.database.guildSettings.get(guild.id);

    let message = await (guild.channels.cache.get(database.selfRoles.channel || '') as discord.TextChannel | null)?.messages.cache.get(
        database.selfRoles.message || ''
    );

    const content = await RoleSelect.build(client, guild);

    console.log(content);

    if (channel) {
        if (message) await message.delete();

        message = await (guild.channels.cache.get(channel) as discord.TextChannel | null)?.send(content);

        if (message) {
            database.selfRoles.channel = message.channel.id;
            database.selfRoles.message = message.id;
            await database.save();
        } else throw new Error(`Failed to send message: Channel ${channel} not found.`);
    } else if (message) await message.edit(content);

    return message;
}
