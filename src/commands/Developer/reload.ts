import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    PermissionFlagsBits } from 'discord.js';
import { loadCommands } from '../../handlers/CommandHandler';
import { loadEvents } from '../../handlers/EventHandler';
import { Client } from '../../interfaces/Client';
import { Command } from '../../interfaces/command';

const command: Command = {
    developer: true,
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reload your commands/events.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((options) => options
        .setName("events")
        .setDescription("Reload your events."))
        .addSubcommand((options) => options
        .setName("commands")
        .setDescription("Reload your commands.")),
	async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const addSubcommand = interaction.options.getSubcommand();

        switch(addSubcommand){
            case "event" : {
                for(const [key, value] of client.events)
                client.removeListener(`${key}`, value);
                loadEvents(client);
                interaction.reply({
                    content: "Reloaded events.",
                    ephemeral: true
                })
            }
            break;
            case "commands" : {
                loadCommands(client);
                interaction.reply({
                    content: "Reloaded commands.",
                    ephemeral: true
                })
            }
            break;
        }
	},
};

module.exports = command;