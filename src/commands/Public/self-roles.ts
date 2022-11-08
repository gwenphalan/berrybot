import * as discord from 'discord.js';
import { Command } from '../../interfaces';
import { selfRoleSettings } from '../../messages';

const command: Command = {
    guildOnly: true,
    data: new discord.SlashCommandBuilder()
        .setName('self-roles')
        .setDescription('View or manage self-assignable roles.')
        .setDefaultMemberPermissions(discord.PermissionFlagsBits.ManageRoles),
    async execute(interaction: discord.ChatInputCommandInteraction, _client) {
        if (!interaction.guild) return;
        interaction.reply(await selfRoleSettings.build(_client, interaction.guild));
    }
};

module.exports = command;
