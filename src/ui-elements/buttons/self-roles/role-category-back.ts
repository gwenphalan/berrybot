import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from 'discord.js';
import { Button } from '../../../interfaces/button';
import { Client } from '../../../interfaces/Client';

const button: Button = {
    custom_id: 'role-category-back',
    async execute(interaction: ButtonInteraction, client: Client) {
        if (!interaction.guild) return;

        const iconUrl = interaction.guild.iconURL({ size: 2048, extension: 'png' });
        const color = client.util.color;

        // Create an embed, set the color to the average color of the guild icon, and set the title to "Guild Name's Self Roles"
        const embed = new EmbedBuilder()
            .setColor(color.hexToRGB(iconUrl != null ? await color.getAverageColor(iconUrl) : color.colorToHex('Aqua')))
            .setTitle(`${interaction.guild.name}'s Self Roles`)
            .setDescription(`Would you like to view, edit, or create a category?`);

        // Create a row, and 3 buttons to the row, one for each option
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder().setCustomId('role-category-view').setLabel('View').setStyle(ButtonStyle.Secondary).setEmoji('🔍'),
            new ButtonBuilder().setCustomId('role-category-edit').setLabel('Edit').setStyle(ButtonStyle.Primary).setEmoji('✏️'),
            new ButtonBuilder().setCustomId('role-category-create').setLabel('Create').setStyle(ButtonStyle.Success).setEmoji('➕')
        ]);

        // Send the embed and row
        interaction.update({
            content: null,
            embeds: [embed],
            components: [row]
        });
    }
};

module.exports = button;
