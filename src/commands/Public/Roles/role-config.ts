import * as discord from 'discord.js';
import { Command } from '@/core/interfaces';
import { RoleConfigFlow } from '@/flows/roles/RoleConfigFlow';
import { LocalizedSlashCommandBuilder } from '@/core/utils/Locale';
// Self-roles management command for server administrators
const command: Command = {
	guildOnly: true,
	data: new LocalizedSlashCommandBuilder()
		.setLocalizedName('commands.role_config.name')
		.setLocalizedDescription('commands.role_config.description')
		.setDefaultMemberPermissions(discord.PermissionFlagsBits.ManageRoles),
	// Required locale keys:
	//   commands.role_config.name: "role-config"
	//   commands.role_config.description: "View or manage self-assignable roles."
	async execute(interaction: discord.ChatInputCommandInteraction, client) {
		// Ensure command is used in a guild
		if (!interaction.guild) return;
		// Build and send the self-role settings message
		client.flowManager.startFlow(interaction, new RoleConfigFlow(client), {
			id: 'main-menu',
			interaction,
		});
	},
};

module.exports = command;
