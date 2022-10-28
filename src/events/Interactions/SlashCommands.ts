import { ChatInputCommandInteraction, Events } from "discord.js";
import { config } from "../../../config";
import { Client } from "../../interfaces/Client";
import { Event } from "../../interfaces/event";

export const event: Event = {
    name: Events.InteractionCreate,
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute(interaction: ChatInputCommandInteraction, client: Client) {
        if(!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) 
        return interaction.reply({
            content: "This command is outdated.",
            ephemeral: true
        });

        if(command.developer && interaction.user.id !== config.developer)
        return interaction.reply({
            content: "This command is only available to developers!",
            ephemeral: true
        });

        const subCommand = interaction.options.getSubcommand();
        if (subCommand) {
            const subCommandFile = client.subCommands.get(`${interaction.commandName}.${subCommand}`);
            if (!subCommandFile) return interaction.reply({
                content: "This sub-command is outdated.",
                ephemeral: true
            })
            subCommandFile.execute(interaction, client);
        } else command.execute(interaction, client);

        return;
    }
};