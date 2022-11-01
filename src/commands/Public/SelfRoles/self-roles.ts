import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../../interfaces/command';

const command: Command = {
    guildOnly: true,
    data: new SlashCommandBuilder()
        .setName('self-roles')
        .setDescription('View or manage self-assignable roles.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subCommand => subCommand.setName('settings').setDescription('View or edit all self-role settings.'))
        .addSubcommand(subCommand =>
            subCommand
                .setName('message')
                .setDescription('Send the self-assignable roles message.')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('The channel to send the message in.')
                        // Ensure the user can only select a TextChannel for output
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        ),
    async execute(_interaction: ChatInputCommandInteraction) {}
};

module.exports = command;
