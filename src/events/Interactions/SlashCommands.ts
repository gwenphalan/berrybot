import { ChatInputCommandInteraction, Events } from 'discord.js';
import { config } from '@/core/config/config';
import type { Client, Event } from '@/core/interfaces';
import { logger } from '@/core/logging/Logger';

// Event handler for slash command interactions
export const event: Event = {
	name: Events.InteractionCreate,
	/**
	 * Handles slash command execution, including subcommands and permission checks
	 * @param {ChatInputCommandInteraction} interaction - The interaction object from Discord
	 */
	execute(interaction: ChatInputCommandInteraction, client: Client) {
		// Only handle chat input commands
		if (!interaction.isChatInputCommand()) return;

		logger.debug(`[SlashCommands.execute] Received slash command: ${interaction.commandName}`);

		// Get the command from our collection
		const command = client.commands.get(interaction.commandName);
		if (!command) {
			logger.warn(`Command not found: ${interaction.commandName}`);
			return interaction.reply({
				content: 'This command is outdated.',
				ephemeral: true,
			});
		}

		logger.debug(
			`[SlashCommands.execute] Found command handler for: ${interaction.commandName}`
		);

		// Check if command is developer-only
		if (config.developer && command.developer && interaction.user.id !== config.developer) {
			logger.warn(
				`User ${interaction.user.id} attempted to use developer-only command: ${interaction.commandName}`
			);
			return interaction.reply({
				content: 'This command is only available to developers!',
				ephemeral: true,
			});
		}

		// Check if command is guild-only
		if (command.guildOnly && !interaction.guild) {
			logger.warn(
				`User ${interaction.user.id} attempted to use guild-only command: ${interaction.commandName} in DMs`
			);
			return interaction.reply({
				content: 'This command is only available in a guild!',
				ephemeral: true,
			});
		}

		try {
			// Check for subcommand usage
			const subCommand = interaction.options.getSubcommand(false);
			if (subCommand) {
				logger.debug(
					`[SlashCommands.execute] Executing subcommand: ${subCommand} for command: ${interaction.commandName}`
				);
				const subCommandFile = client.subCommands.get(
					`${interaction.commandName}.${subCommand}`
				);
				if (!subCommandFile) {
					logger.warn(`Subcommand not found: ${interaction.commandName}.${subCommand}`);
					return interaction.reply({
						content: 'This sub-command is outdated.',
						ephemeral: true,
					});
				}
				logger.debug(
					`[SlashCommands.execute] Found subcommand handler for: ${interaction.commandName}.${subCommand}`
				);
				subCommandFile.execute(interaction, client);
			} else {
				// Execute main command if no subcommand
				logger.debug(
					`[SlashCommands.execute] Executing main command: ${interaction.commandName}`
				);
				command.execute(interaction, client);
			}
		} catch (error) {
			// Get subcommand name if it exists
			const subCommandName = interaction.options.getSubcommand(false);
			logger.error(
				{
					error,
					command: interaction.commandName,
					subcommand: subCommandName,
					user: interaction.user.id,
					guild: interaction.guild?.id,
				},
				'Error executing command'
			);
		}
		return;
	},
};
