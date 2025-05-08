import { ChatInputCommandInteraction, Events } from 'discord.js';
import { config } from '@/core/config/config';
import type { Client, Event } from '@/core/interfaces';
import { logger, prettyError } from '@/core/logging/Logger';
import { error as errorMessageBuilder } from '@/messages/general/error';
import { randomUUID } from 'crypto';
import { database } from '@/core/config/database';
import { errorLog } from '@/messages/general/error-log';
import { toDiscordLocale } from '@/core/utils/Locale';

// Event handler for slash command interactions
export const event: Event = {
	name: Events.InteractionCreate,
	/**
	 * Handles slash command execution, including subcommands and permission checks
	 * @param {ChatInputCommandInteraction} interaction - The interaction object from Discord
	 */
	execute: async (interaction: ChatInputCommandInteraction, client: Client) => {
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
				const locale = await resolveLocale(interaction);
				await subCommandFile.execute(interaction, client, locale);
			} else {
				// Execute main command if no subcommand
				logger.debug(
					`[SlashCommands.execute] Executing main command: ${interaction.commandName}`
				);
				const locale = await resolveLocale(interaction);
				await command.execute(interaction, client, locale);
			}
		} catch (error) {
			const errorId = randomUUID();
			// Get subcommand name if it exists
			const subCommandName = interaction.options.getSubcommand(false);
			// Use prettyError for both console and file logging
			prettyError(logger, {
				errorId,
				command: interaction.commandName,
				subcommand: subCommandName,
				user: interaction.user.id,
				guild: interaction.guild?.id || null,
				message: error instanceof Error ? error.message : String(error),
				error: error instanceof Error ? error : String(error),
			});

			// Upload error to database
			try {
				await database.errorLogs.create({
					errorId,
					command: interaction.commandName,
					subcommand: subCommandName,
					user: interaction.user.id,
					guild: interaction.guild?.id || null,
					errorMessage: error instanceof Error ? error.message : String(error),
					stackTrace: error instanceof Error && error.stack ? error.stack : '',
				});
			} catch (dbError) {
				logger.error(
					{ dbError },
					'[SlashCommands.execute] Failed to upload error to database'
				);
			}

			// Send error log to error log channel if configured
			if (config.error_log_channel) {
				try {
					const channel = await client.channels.fetch(config.error_log_channel);
					if (channel && 'send' in channel) {
						const errorLogMsg = await errorLog.build(
							client,
							error instanceof Error ? error : new Error(String(error)),
							errorId,
							{
								command: interaction.commandName,
								subcommand: subCommandName,
								user: interaction.user.id,
								guild: interaction.guild?.id || null,
								createdAt: new Date(),
							}
						);
						await channel.send(errorLogMsg);
					} else {
						logger.error(
							'[SlashCommands.errorLog] The error log channel was not found or is not a text-based channel.',
							{ channel }
						);
					}
				} catch (sendError: any) {
					let reason = '[SlashCommands.errorLog] Failed to send error log to channel: ';
					if (sendError.code === 50001) {
						reason += 'Missing access to channel (bot may lack permissions).';
					} else if (sendError.code === 10003) {
						reason += 'Channel not found.';
					} else if (sendError.message && sendError.message.includes('not a function')) {
						reason += 'Channel does not support sending messages.';
					} else {
						reason += sendError.message || 'Unknown error.';
					}
					logger.error({ sendError }, reason);
				}
			}

			try {
				if (interaction.replied || interaction.deferred) {
					const errorMsg = await errorMessageBuilder.build(
						client,
						error instanceof Error ? error : new Error(String(error)),
						errorId
					);
					await interaction.followUp({
						...errorMsg,
						ephemeral: true,
					});
				} else {
					const errorMsg = await errorMessageBuilder.build(
						client,
						error instanceof Error ? error : new Error(String(error)),
						errorId
					);
					await interaction.reply({
						...errorMsg,
						ephemeral: true,
					});
				}
			} catch (err) {
				logger.error({ err }, '[SlashCommands.execute] Failed to send error reply');
			}
		}
		return;
	},
};

// Helper to resolve locale
async function resolveLocale(interaction: ChatInputCommandInteraction) {
	const userId = interaction.user?.id;
	if (userId) {
		const userSettings = await database.userSettings.get(userId);
		return toDiscordLocale(userSettings?.locale || interaction.locale || 'en-US');
	}
	return toDiscordLocale(interaction.locale || 'en-US');
}
