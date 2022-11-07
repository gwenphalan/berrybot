import { ActionRowBuilder, ButtonInteraction, ChannelType, PermissionFlagsBits, SelectMenuBuilder } from 'discord.js';
import { Button } from '../../../interfaces/button';
import { Client } from '../../../interfaces/Client';

const button: Button = {
    custom_id: 'send-role-message',
    async execute(interaction: ButtonInteraction, _client: Client) {
        if (!interaction.guild || !interaction.guildId) return;

        const member = interaction.guild.members.cache.find(member => member.id === interaction.user.id);

        if (member?.roles.cache.some(role => role.permissions.has(PermissionFlagsBits.ManageRoles))) {
            return interaction.reply({ content: 'You do not have permission to use this button.', ephemeral: true });
        }

        const channelSelectMenu = new SelectMenuBuilder()
            .setCustomId('role-message-channel')
            .setPlaceholder('Select a channel')
            .setMinValues(1)
            .setMaxValues(1);

        interaction.guild.channels.cache
            .filter(
                channel =>
                    channel.type === ChannelType.GuildText &&
                    channel.permissionsFor(interaction.guild?.members.me!)?.has(PermissionFlagsBits.SendMessages) &&
                    channel.permissionsFor(interaction.guild?.members.me!)?.has(PermissionFlagsBits.EmbedLinks)
            )
            .forEach(channel => {
                channelSelectMenu.addOptions({
                    label: channel.name,
                    value: channel.id
                });
            });

        const actionRow = new ActionRowBuilder<SelectMenuBuilder>().addComponents(channelSelectMenu);

        return interaction.update({
            embeds: [],
            components: [actionRow]
        });
    }
};

module.exports = button;
