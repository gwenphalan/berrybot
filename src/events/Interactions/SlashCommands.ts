import { ChatInputCommandInteraction, Events } from 'discord.js';
import { config } from '../../../config';
import { Client } from '../../interfaces/Client';
import { Event } from '../../interfaces/event';

export const event: Event = {
    name: Events.InteractionCreate,
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    execute(interaction: ChatInputCommandInteraction, client: Client) {
        // If the interaction is not a slash command, return
        if (!interaction.isChatInputCommand()) return;

        // Get the command from the client.
        const command = client.commands.get(interaction.commandName);

        // If the command does not exist, return.
        if (!command) {
            return interaction.reply({
                content: 'This command is outdated.',
                ephemeral: true
            });
        }

        // If the user is not a developer, return.
        if (command.developer && interaction.user.id !== config.developer) {
            return interaction.reply({
                content: 'This command is only available to developers!',
                ephemeral: true
            });
        }

        if (command.guildOnly && !interaction.guild) {
            return interaction.reply({
                content: 'This command is only available in a guild!',
                ephemeral: true
            });
        }

        try {
            const subCommand = interaction.options.getSubcommand(false);
            if (subCommand) {
                console.log(`Subcommand ${subCommand} was used!`);
                const subCommandFile = client.subCommands.get(`${interaction.commandName}.${subCommand}`);
                if (!subCommandFile)
                    return interaction.reply({
                        content: 'This sub-command is outdated.',
                        ephemeral: true
                    });
                subCommandFile.execute(interaction, client);
            } else {
                command.execute(interaction, client);
            }
        } catch (error) {
            console.log(error);
            return interaction.reply({
                content: 'An error occurred while executing the command.',
                ephemeral: true
            });
        }

        return;
    }
};
