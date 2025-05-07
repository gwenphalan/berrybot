import * as discord from 'discord.js';
import { Command } from '@/core/interfaces';
import { RoleConfigFlow } from '@/flows/roles/RoleConfigFlow';
import { LocalizedSlashCommandBuilder } from '@/core/utils/Locale';
// Self-roles management command for server administrators
const command: Command = {
	guildOnly: true,
	data: new LocalizedSlashCommandBuilder()
		.setName('role-config')
		.setDescription('View or manage self-assignable roles.')
		.setDefaultMemberPermissions(discord.PermissionFlagsBits.ManageRoles),
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
