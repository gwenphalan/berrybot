import { EmbedBuilder } from '@discordjs/builders';
import { ActionRowBuilder, APIMessageComponentEmoji, ButtonBuilder, ButtonStyle, Guild, PermissionFlagsBits, TextChannel } from 'discord.js';
import { Client } from '../interfaces/Client';

export async function sendRoleMessage(client: Client, guild: Guild, channel: TextChannel) {
    // throw error if client does not have permissions to send messages in the channel
    if (!channel.permissionsFor(guild.members.me!)?.has(PermissionFlagsBits.SendMessages))
        throw new Error('Missing permissions to send messages in the channel');

    // put guild settings in a variable
    const guildSettings = await client.database.guildSettings.get(guild.id);

    // if guildSettings.selfRoles is undefined, throw error
    if (!guildSettings.selfRoles) throw new Error('Self Roles is not enabled');

    // Create an embed with the guild's name and icon
    const embed = new EmbedBuilder()
        .setColor(await client.util.color.getGuildColor(guild, true))
        .setTitle(`${guild.name}'s Self Roles`)
        .setDescription(`Choose a category to view and select the roles you want to add.`)
        .setThumbnail(guild.iconURL({ extension: 'png', size: 256 }) || '');

    // Create a list of rows, with up to five rows, each containing up to five buttons. For each category, add a button with the category name as the label, `role-select["category.name"]` as the custom id, and the category emoji as the emoji, if there is one.
    const rows = [];
    let row = new ActionRowBuilder<ButtonBuilder>();
    for (const category of guildSettings.selfRoles.categories) {
        if (row.components.length >= 5) {
            rows.push(row);
            row = new ActionRowBuilder();
        }
        const button = new ButtonBuilder().setLabel(category.name).setCustomId(`role-select["${category.name}"]`).setStyle(ButtonStyle.Primary);
        if (category.emoji) button.setEmoji(await getEmoji(category.emoji));
        row.addComponents(button);
    }
    // if there are buttons in the row, push the row
    if (row.components.length > 0) rows.push(row);

    // Send the embed and row to the channel

    const message = await channel.send({ embeds: [embed], components: rows });

    guildSettings.selfRoles.message = message.id;
    guildSettings.selfRoles.channel = channel.id;

    return await client.database.guildSettings.update(guild.id, guildSettings);
}

/**
 * Edits the existing role message with the self role categories, catches any errors and logs them to the console.
 * @param client The client
 * @param guild The guild to edit the role message for
 */
export async function updateRoleMessage(client: Client, guild: Guild) {
    // Get the guild's settings
    const guildSettings = await client.database.guildSettings.get(guild.id);

    // If the guild's settings do not have a selfRoles object, throw an error
    if (!guildSettings.selfRoles) return;

    // If the guild's settings do not have a message id, throw an error
    if (!guildSettings.selfRoles.message) return;

    // If the guild's settings do not have a channel id, throw an error
    if (!guildSettings.selfRoles.channel) return;

    // Get the channel from the guild
    const channel = guild.channels.cache.get(guildSettings.selfRoles.channel) as TextChannel;

    // If the channel is undefined, throw an error
    if (!channel) return;

    // Get the message from the channel
    const message = await channel.messages.fetch(guildSettings.selfRoles.message);

    // If the message is undefined, remove the message id and channel id from the guild's settings and return
    if (!message) {
        guildSettings.selfRoles.message = undefined;
        guildSettings.selfRoles.channel = undefined;
        await client.database.guildSettings.update(guild.id, guildSettings);
        return;
    }

    // Create an embed with the guild's name and icon
    const embed = new EmbedBuilder()
        .setColor(await client.util.color.getGuildColor(guild, true))
        .setTitle(`${guild.name}'s Self Roles`)
        .setDescription(`Choose a category to view and select the roles you want to add.`)
        .setThumbnail(guild.iconURL({ extension: 'png', size: 256 }) || '');

    // Create a list of rows, with up to five rows, each containing up to five buttons. For each category, add a button with the category name as the label, `role-select["category.name"]` as the custom id, and the category emoji as the emoji, if there is one.
    const rows = [];
    let row = new ActionRowBuilder<ButtonBuilder>();
    for (const category of guildSettings.selfRoles.categories) {
        if (row.components.length >= 5) {
            rows.push(row);
            row = new ActionRowBuilder();
        }
        const button = new ButtonBuilder().setLabel(category.name).setCustomId(`role-select["${category.name}"]`).setStyle(ButtonStyle.Primary);
        if (category.emoji) button.setEmoji(await getEmoji(category.emoji));
        row.addComponents(button);
    }
    // if there are buttons in the row, push the row
    if (row.components.length > 0) rows.push(row);

    // Update the guild's settings with the new message id and channel id
    guildSettings.selfRoles.message = message.id;
    guildSettings.selfRoles.channel = channel.id;

    await guildSettings.save();

    // Edit the message with the embed and select menu
    await message.edit({ embeds: [embed], components: rows });
}

/**
 * Check if an emoji is a snowflake emoji (e.g 852027302832767057) or a unicode emoji (e.g 🤖), return APIMessageComponentEmoji with the emoji set to id if snowflake, or name if unicode.
 * @param {string} emoji The emoji to check
 * @returns {APIMessageComponentEmoji} The emoji object
 */
async function getEmoji(emoji: string): Promise<APIMessageComponentEmoji> {
    // If the emoji is a snowflake, return the emoji id
    if (emoji.match(/^\d+$/)) {
        return {
            id: emoji
        };
    }
    // If the emoji is a unicode emoji, return the emoji name
    else {
        return {
            name: emoji
        };
    }
}
