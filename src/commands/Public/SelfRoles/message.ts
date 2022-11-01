import { ChannelType, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { Client } from '../../../interfaces/Client';
import { Command } from '../../../interfaces/command';
import { sendRoleMessage } from '../../../util/selfRoles';

const command: Command = {
    subCommand: 'self-roles.message',
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const channel = interaction.options.getChannel('channel', true);

        // Check if the channel is a TextChannel
        if (channel.type !== ChannelType.GuildText) return interaction.reply({ content: 'You can only select a text channel.', ephemeral: true });

        if (!interaction.guild || !interaction.guildId) return;

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

        await sendRoleMessage(client, interaction.guild, channel as TextChannel);

        return interaction.reply({ content: `Sent the self-roles message to ${channel}.`, ephemeral: true });
    }
};

module.exports = command;
