import { ChatInputCommandInteraction } from 'discord.js';
import { loadCommands } from '../../../handlers/CommandHandler';
import { Client } from '../../../interfaces/Client';
import { Command } from '../../../interfaces/command';

const command: Command = {
    subCommand: "reload.commands",
    execute(interaction: ChatInputCommandInteraction, client: Client) {
                loadCommands(client);
                interaction.reply({
                    content: "Reloaded commands.",
                    ephemeral: true
                })
    }
};

module.exports = command;