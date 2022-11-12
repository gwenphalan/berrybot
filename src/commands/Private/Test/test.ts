import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../../interfaces';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Test different aspects of the bot.')
        .addSubcommand(subcommand => subcommand.setName('modals').setDescription("Test the bot's modals handler."))
        .addSubcommand(subcommand => subcommand.setName('buttons').setDescription("Test the bot's buttons handler."))
        .addSubcommand(subcommand => subcommand.setName('embed').setDescription('Get an example embedded message'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('select-menus')
                .setDescription("Test the bot's select menu handler.")
                .addStringOption(option =>
                    option.setName('type').setDescription('The type of select menu to test.').setRequired(true).addChoices(
                        {
                            name: 'Single Select',
                            value: 'single'
                        },
                        {
                            name: 'Multi Select',
                            value: 'multi'
                        }
                    )
                )
        ),
    async execute(_interaction: ChatInputCommandInteraction) {}
};

module.exports = command;
