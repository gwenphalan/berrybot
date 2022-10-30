import { EmbedBuilder } from '@discordjs/builders';
import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { Client } from '../../../interfaces/Client';
import { Command } from '../../../interfaces/command';
import { getRegionNameAndEmoji } from '../../../util/regionUtil';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('View, edit, or reset the settings for the server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        // If the command wasn't used in a guild, return and send a message.
        if (!interaction.guild || !interaction.guildId) return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });

        // if there is no interaction member, return and send a message.
        if (!interaction.member) return interaction.reply({ content: 'An error occurred while fetching the person who used the command.', ephemeral: true });

        // if the interaction user doesn't have the Manage Guild permission, return and send a message.
        // Put the member permissions into a variable, and check if the member permissions is a string or Readonly<PermissionsBitField>.
        const memberPermissions = interaction.member?.permissions;

        if (typeof memberPermissions === 'string') {
            if (!memberPermissions.includes('MANAGE_GUILD'))
                return interaction.reply({ content: 'You do not have the Manage Server permission.', ephemeral: true });
        } else if (typeof memberPermissions === typeof PermissionFlagsBits) {
            if (!memberPermissions.has(PermissionFlagsBits.ManageGuild))
                return interaction.reply({ content: 'You do not have the Manage Server permission.', ephemeral: true });
        }

        // Put the settings into a variable.
        const settings = client.database.guildSettings.get(interaction.guildId);

        // If the settings are not found, return and send a message.
        if (!settings) return interaction.reply({ content: 'An error occurred while fetching the settings for this server.', ephemeral: true });

        // Put the interaction guild into a variable.
        const guild = interaction.guild;

        // Put the guild icon into a variable.
        const guildIcon = guild.iconURL({
            extension: 'png',
            size: 256
        });

        const settingsEmbed = new EmbedBuilder()
            .setTitle(`Settings for ${interaction.guild.name}`)
            .addFields([
                {
                    name: `Member Count`,
                    value: `${guild.memberCount}`,
                    inline: true
                },
                {
                    name: `Server Creation Date`,
                    value: `${guild.createdAt.getMonth() + 1}/${guild.createdAt.getDate()}/${guild.createdAt.getFullYear()}`,
                    inline: true
                },
                {
                    name: `Server Owner`,
                    value: `${(await guild.fetchOwner()).user.tag}`,
                    inline: true
                },
                {
                    name: `Server Region`,
                    value: `${getRegionNameAndEmoji(guild.preferredLocale).emoji} - ${getRegionNameAndEmoji(guild.preferredLocale).region}`,
                    inline: true
                }
            ])
            // Set the embed thumbnail to the guild icon.
            .setThumbnail(guild.iconURL() || '')
            // Set the embed color to the dominant color of the guild icon using client.util.color.dominantColor.
            .setColor(
                guildIcon
                    ? client.util.color.hexToRGB(await client.util.color.getAverageColor(guildIcon))
                    : client.util.color.hexToRGB(client.util.color.colorToHex())
            );

        // Send the settings embed.
        return interaction.reply({ embeds: [settingsEmbed], ephemeral: true });
    }
};

module.exports = command;
