import { Guild, InteractionUpdateOptions, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { SelfRoleCategory } from '../database/schemas/GuildSettings';
import { Client } from '../interfaces/Client';

export async function roleCategoryEditMessage(client: Client, guild: Guild, category: SelfRoleCategory): Promise<InteractionUpdateOptions> {
    const iconURL = guild.iconURL({ size: 2048, extension: 'png' });
    const embedColor = client.util.color.hexToRGB(iconURL != null ? await client.util.color.getAverageColor(iconURL) : client.util.color.colorToHex('Aqua'));
    // Create an ActionRow with 4 buttons:
    // Edit Name: custom_id 'role-category-edit-name', label 'Edit Name', style ButtonStyle.Primary, emoji '✏️'
    // Edit Emoji: custom_id 'role-category-edit-emoji', label 'Edit Emoji', style ButtonStyle.Primary, emoji '🎨'
    // Edit Roles: custom_id 'role-category-edit-roles', label 'Edit Roles', style ButtonStyle.Primary, emoji '📜'
    // Back: custom_id 'role-category-edit', label 'Back', style ButtonStyle.Secondary, emoji '⬅️'
    // Each button is a new ButtonBuilder
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder().setCustomId(`role-category-edit-name["${category.name}"]`).setLabel('Edit Name').setStyle(ButtonStyle.Primary).setEmoji('✏️'),
        new ButtonBuilder().setCustomId(`role-category-edit-emoji["${category.name}"]`).setLabel('Edit Emoji').setStyle(ButtonStyle.Primary).setEmoji('🎨'),
        new ButtonBuilder().setCustomId(`role-category-edit-roles["${category.name}"]`).setLabel('Edit Roles').setStyle(ButtonStyle.Primary).setEmoji('📜'),
        new ButtonBuilder().setCustomId(`role-category-delete["${category.name}"]`).setLabel(`Delete`).setStyle(ButtonStyle.Danger).setEmoji('🗑️')
    ]);

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder().setCustomId('role-category-back').setLabel('Back').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
    ]);

    // Create an embed with the category information, and the ActionRow with the 4 buttons
    const embed = new EmbedBuilder()
        .setTitle(`Editing ${category.name}`)
        .setFields([
            {
                name: 'Name',
                value: category.name,
                inline: true
            },
            {
                name: 'Emoji',
                value: category.emoji || 'None',
                inline: true
            },
            {
                name: 'Roles',
                value: category.roles?.length > 0 ? category.roles.map(role => `<@&${role}>`).join(', ') : 'None'
            }
        ])
        .setColor(embedColor);
    return {
        embeds: [embed],
        components: [row, row2]
    };
}
