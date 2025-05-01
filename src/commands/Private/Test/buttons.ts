import { ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { buttons } from '../../../components';
import { Command } from '../../../interfaces';

const command: Command = {
    parent: 'test',
    data: new SlashCommandSubcommandBuilder()
        .setName('button')
        .setDescription('Test button'),
    async execute(interaction: ChatInputCommandInteraction, client) {
        // Return if the interaction wasn't used in a guild.
        if (!interaction.guild) {
            return await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
        }

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(await buttons.TestButton.build(client));

        return await interaction.reply({ content: 'Test Button', components: [row] });
    }
};

module.exports = command;
