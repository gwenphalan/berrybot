import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { Command } from '../../../interfaces';

const command: Command = {
    parent: 'test',
    data: new SlashCommandSubcommandBuilder()
        .setName('embed')
        .setDescription('Test embed'),
    async execute(interaction: ChatInputCommandInteraction, _client) {
        const embed = new EmbedBuilder().setTitle('Example').setDescription('This is an example message.')
        return await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};

module.exports = command;
