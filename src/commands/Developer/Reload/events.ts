import { ChatInputCommandInteraction } from 'discord.js';
import { loadEvents } from '../../../handlers/EventHandler';
import { Client } from '../../../interfaces/Client';
import { Command } from '../../../interfaces/command';

const command: Command = {
    subCommand: "reload.events",
    execute(interaction: ChatInputCommandInteraction, client: Client) {
                for(const [key, value] of client.events)
                client.removeListener(`${key}`, value);
                loadEvents(client);
                interaction.reply({
                    content: "Reloaded events.",
                    ephemeral: true
                })
    }
};

module.exports = command;