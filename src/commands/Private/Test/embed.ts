import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../../interfaces';
import { example } from '../../../messages';

const command: Command = {
    subCommand: 'test.embed',
    async execute(interaction: ChatInputCommandInteraction, client) {
        return await interaction.reply(await example.build(client));
    }
};

module.exports = command;
