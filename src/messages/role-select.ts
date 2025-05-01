import * as discord from 'discord.js';
import { ButtonBuilder } from 'discord.js';
import { util } from '../bot';
import { Client, MessageBuilder } from '../interfaces';
import RoleCategory from '../components/buttons/role-category';

export const RoleSelect: MessageBuilder = {
    embeds: [new discord.EmbedBuilder().setTitle('Example').setDescription('Choose a category to view and select the roles you want to add.')],
    components: [],
    async build(client, guild: discord.Guild) {
        this.embeds[0]
            .setColor(await util.Color.getGuildColor(guild, true))
            .setTitle(`${guild.name}'s Self Roles`)
            .setDescription(`Choose a category to view and select the roles you want to add.`);

        if (guild.iconURL()) this.embeds[0].setThumbnail(guild.iconURL({ extension: 'png', size: 256 }));

        const rows = [];
        const database = await client.database.guildSettings.get(guild.id);

        let row = new discord.ActionRowBuilder<ButtonBuilder>();

        for (const category of database.selfRoles.categories) {
            if (row.components.length >= 5) {
                rows.push(row);
                row = new discord.ActionRowBuilder();
            }

            const button = await RoleCategory.build(client, 'assign', category.name, guild.id);
            if (category.emoji) button.setEmoji(category.emoji);
            row.addComponents(button);
        }

        rows.push(row);

        return {
            embeds: this.embeds,
            components: rows
        };
    }
};

export async function RoleMessage(client: Client, guild: discord.Guild, channel?: string) {
    const database = await client.database.guildSettings.get(guild.id);

    let message =
        database.selfRoles.channel && database.selfRoles.message
            ? await (guild.channels.cache.get(database.selfRoles.channel) as discord.TextChannel | null)?.messages.fetch(database.selfRoles.message).catch()
            : null;

    const content = await RoleSelect.build(client, guild);

    if (channel) {
        if (message) await message.delete().then(m => console.log(`Deleted Message with id: ${m.id}`));

        message = await (guild.channels.cache.get(channel) as discord.TextChannel | null)?.send(content);

        if (message) {
            database.selfRoles.channel = message.channel.id;
            database.selfRoles.message = message.id;
            await database.save();
        } else console.log(new Error(`Failed to send message: Channel ${channel} not found.`));
    } else if (message) {
        await message
            .edit(content)
            .then(m => console.log(`Edited Message with id: ${m.id}`))
            .catch(e => console.log(e));
    } else {
        database.selfRoles.channel = undefined;
        database.selfRoles.message = undefined;
        await database.save();
    }

    return message;
}
