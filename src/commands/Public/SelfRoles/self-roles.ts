import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Client } from '../../../interfaces/Client';
import { Command } from '../../../interfaces/command';

const command: Command = {
    guildOnly: true,
    data: new SlashCommandBuilder()
        .setName('self-roles')
        .setDescription('View or manage self-assignable roles.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
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
            new ButtonBuilder().setCustomId('role-category-edit').setLabel('Edit').setStyle(ButtonStyle.Secondary).setEmoji('✏️'),
            new ButtonBuilder().setCustomId('role-category-create').setLabel('Create').setStyle(ButtonStyle.Success).setEmoji('➕')
        ]);

        const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder().setCustomId('send-role-message').setLabel('Send Role Message').setStyle(ButtonStyle.Primary).setEmoji('📨')
        ]);

        // Send the embed and row
        interaction.reply({
            embeds: [embed],
            components: [row, row2]
        });
    }
};

module.exports = command;
