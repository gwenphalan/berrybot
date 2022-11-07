import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { Client } from '../../../interfaces/Client';
import { Command } from '../../../interfaces/command';

const command: Command = {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reload your commands/events.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(options => options.setName('events').setDescription('Reload your events.'))
        .addSubcommand(options => options.setName('commands').setDescription('Reload your commands.')),
    async execute(_interaction: ChatInputCommandInteraction, _client: Client) {}
};

module.exports = command;
