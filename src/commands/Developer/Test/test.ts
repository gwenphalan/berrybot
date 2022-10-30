import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../../interfaces/command';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Test different aspects of the bot.')
        .addSubcommand(subcommand => subcommand.setName('modals').setDescription("Test the bot's modals handler.")),
    async execute(_interaction: ChatInputCommandInteraction) {}
};

module.exports = command;
