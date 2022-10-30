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

        console.log(`Received interaction ${interaction.commandName} from ${interaction.user.tag}`);
        // Get the command from the client.
        const command = client.commands.get(interaction.commandName);
        console.log(
            `Command ${interaction.commandName} was executed by ${interaction.user.tag} [${interaction.user.id}] in ${interaction.guild?.name} [${interaction.guild?.id}]`
        );

        console.log(`Checking if command ${interaction.commandName} exists...`);
        // If the command does not exist, return.
        if (!command) {
            console.log(`Command ${interaction.commandName} does not exist!`);
            return interaction.reply({
                content: 'This command is outdated.',
                ephemeral: true
            });
        }
        console.log(`Command ${interaction.commandName} exists!`);

        console.log(`Checking if ${interaction.user.tag} needs to be a developer...`);
        // If the user is not a developer, return.
        if (command.developer && interaction.user.id !== config.developer) {
            console.log(`User ${interaction.user.tag} [${interaction.user.id}] is not a developer!`);
            return interaction.reply({
                content: 'This command is only available to developers!',
                ephemeral: true
            });
        }
        console.log(`User ${interaction.user.tag} [${interaction.user.id}] is a developer/does not need to be a developer!`);

        console.log(`Attempting to execute command ${interaction.commandName}...`);
        try {
            const subCommand = interaction.options.getSubcommand();
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
