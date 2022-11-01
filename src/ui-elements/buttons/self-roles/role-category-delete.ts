import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from 'discord.js';
import { Button } from '../../../interfaces/button';
import { Client } from '../../../interfaces/Client';
import { updateRoleMessage } from '../../../util/selfRoles';

const button: Button = {
    custom_id: 'role-category-delete',
    async execute(interaction: ButtonInteraction, client: Client, label?: string) {
        if (!interaction.guild || !interaction.member) return;
        const categoryName = label;

        // Get the guildSettings from the client.database
        const guildSettings = await client.database.guildSettings.get(interaction.guild?.id);

        // If the guildSettings is null, return an error message
        if (guildSettings == null) {
            return interaction.update({
                content: 'An error occurred while trying to delete the category.'
            });
        }

        // If guildSettings.selfRoles is null, guildSettings.selfRoles.categories is null, or guildSettings.selfRoles.categories.length is 0, return an error message
        if (guildSettings.selfRoles == null || guildSettings.selfRoles.categories == null || guildSettings.selfRoles.categories.length === 0) {
            return interaction.update({
                content: 'There are no categories to delete.'
            });
        }

        // If the category name is null, return an error message
        if (categoryName == null) {
            return interaction.update({
                content: 'An error occurred while trying to delete the category.'
            });
        }

        // Remove the category from guildSettings.selfRoles.categories
        guildSettings.selfRoles.categories = guildSettings.selfRoles.categories.filter(category => category.name !== categoryName);

        // Save the guildSettings
        await guildSettings.save();

        // Create an embed with Title "Deleted Category" and Description "Successfully deleted the category." the average color of the guild's icon or aqua if the guild has no icon
        const embed = new EmbedBuilder()
            .setTitle('Deleted Category')
            .setDescription('Successfully deleted the category.')
            .setColor(await client.util.color.getGuildColor(interaction.guild));

        // Create a row with a "Back" button with custom_id "role-category-back"
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('role-category-back').setLabel('Back').setStyle(ButtonStyle.Primary).setEmoji('⬅️')
        );

        await updateRoleMessage(client, interaction.guild);
        // Update the interaction with the embed and row
        return interaction.update({
            embeds: [embed],
            components: [row]
        });
    }
};

module.exports = button;
