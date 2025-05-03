import * as discord from 'discord.js';
import { Command } from '../../interfaces';
import { selfRoleSettings } from '../../messages';

// Self-roles management command for server administrators
const command: Command = {
	guildOnly: true,
	data: new discord.SlashCommandBuilder()
		.setName('self-roles')
		.setDescription('View or manage self-assignable roles.')
		.setDefaultMemberPermissions(discord.PermissionFlagsBits.ManageRoles),
	async execute(interaction: discord.ChatInputCommandInteraction, _client) {
		// Ensure command is used in a guild
		if (!interaction.guild) return;
		// Build and send the self-role settings message
		interaction.reply(await selfRoleSettings.build(_client, interaction.guild));
	},
};

module.exports = command;
