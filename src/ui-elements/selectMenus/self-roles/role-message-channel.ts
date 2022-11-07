import {
    ActionRowBuilder,
    APISelectMenuOption,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits,
    SelectMenuInteraction,
    TextChannel
} from 'discord.js';
import { Client } from '../../../interfaces/Client';
import { SelectMenu } from '../../../interfaces/selectMenu';
import { sendRoleMessage } from '../../../util/selfRoles';

const selectMenu: SelectMenu = {
    custom_id: 'role-message-channel',
    multi_select: false,
    async execute(interaction: SelectMenuInteraction, selected: APISelectMenuOption, client: Client) {
        if (!interaction.guild || !interaction.guildId) return;

        const member = interaction.guild.members.cache.find(member => member.id === interaction.user.id);

        if (member?.roles.cache.some(role => role.permissions.has(PermissionFlagsBits.ManageRoles))) {
            return interaction.reply({ content: 'You do not have permission to use this button.', ephemeral: true });
        }

        const channel = interaction.guild.channels.cache.find(channel => channel.id === selected.value && channel.type === ChannelType.GuildText);

        if (!channel) {
            return interaction.update({ content: 'That channel does not exist.' });
        }

        // Get the database
        const database = await client.database.guildSettings.get(interaction.guildId);

        // Check if there is already a selfRoles.message and selfRoles.channel in the database. If there is, check if the channel exists, If it does, check if the message exists in the channel, if it does, delete it
        if (database.selfRoles?.message && database.selfRoles?.channel) {
            const oldChannel = interaction.guild.channels.cache.find(channel => channel.id === database.selfRoles?.channel);
            if (oldChannel && oldChannel.type === ChannelType.GuildText) {
                const oldMessage = oldChannel.messages.cache.find(message => message.id === database.selfRoles?.message);
                if (oldMessage) {
                    oldMessage.delete();
                }
            }
        }

        try {
            await sendRoleMessage(client, interaction.guild, channel as TextChannel);
        } catch (error) {
            return interaction.update({ content: 'There was an error sending the message.' });
        }

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
            // Back Button
            new ButtonBuilder().setCustomId('role-category-back').setLabel('Back').setStyle(ButtonStyle.Primary).setEmoji('⬅️')
        ]);

        return interaction.update({ content: `Sent the self-roles message to ${channel}.`, components: [row] });
    }
};

module.exports = selectMenu;
