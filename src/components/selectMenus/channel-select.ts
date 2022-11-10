// Test Single Select Menu

import { ChannelType, Guild, PermissionFlagsBits, SelectMenuBuilder } from 'discord.js';
import { ComponentTypes, SelectMenuComponent } from '../../interfaces/MessageComponent';
import { RoleMessage } from '../../messages/role-select';

export const MessageComponent: SelectMenuComponent = {
    id: 'channel-select',
    type: ComponentTypes.SelectMenu,

    async build(_client, guild: Guild) {
        const channelSelectMenu = new SelectMenuBuilder().setCustomId(this.id).setPlaceholder('Select a channel').setMinValues(1).setMaxValues(1);
        guild.channels.cache
            .filter(
                channel =>
                    channel.type === ChannelType.GuildText &&
                    channel.permissionsFor(guild?.members.me!)?.has(PermissionFlagsBits.SendMessages) &&
                    channel.permissionsFor(guild?.members.me!)?.has(PermissionFlagsBits.EmbedLinks)
            )
            .forEach(channel => {
                channelSelectMenu.addOptions({
                    label: channel.name,
                    value: channel.id
                });
            });

        return channelSelectMenu;
    },

    async execute(interaction, client, selected) {
        if (!interaction.guild) return;

        await RoleMessage(client, interaction.guild, selected.value).catch(err => interaction.reply({ content: err.message, components: [], ephemeral: true }));

        interaction.update({ content: `Self Roles Message Sent`, components: [] }).catch(err => console.error(err));
    }
};

export default MessageComponent;
