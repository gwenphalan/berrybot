import { SlashCommandBuilder, ChatInputCommandInteraction, SlashCommandStringOption, GuildMember } from 'discord.js';
import { Command } from '../interfaces/command';


const command: Command = {
    data: new SlashCommandBuilder()
        .setName('nickname')
        .setDescription('Set your nickname on the server!')
        .addStringOption(
            new SlashCommandStringOption()
                .setName('nickname')
                .setDescription('Nickname')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.inGuild()) {
            interaction.reply('This command must be used in a server!');
            return;
        };


        const member: GuildMember = <GuildMember>interaction.member;

        await member.setNickname(interaction.options.getString('nickname', true))
    },
};

module.exports = command;