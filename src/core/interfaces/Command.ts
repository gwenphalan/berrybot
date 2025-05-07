import type { ChatInputCommandInteraction } from 'discord.js';
import type { Client } from '@/core/client/BerryClient';
import {
	LocalizedSlashCommandBuilder,
	LocalizedSlashCommandSubcommandBuilder,
} from '@/core/utils/Locale';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

/**
 * Base command interface for slash commands
 * Represents a top-level command that can optionally have subcommands
 */
export type BaseCommand = {
	/** Optional parent command name if this is a subcommand */
	parent?: string;
	/** Whether this command is restricted to developers only */
	developer?: boolean;
	/** Whether this command can only be used in guilds (not DMs) */
	guildOnly?: boolean;
	/** The slash command data including name, description, and options */
	data: SlashCommandBuilder | LocalizedSlashCommandBuilder;
	/**
	 * Command execution handler
	 * @param interaction - The interaction object from Discord
	 * @param client - The bot client instance
	 * @param locale - The resolved locale string
	 * @returns Promise<void>
	 */
	execute(
		interaction: ChatInputCommandInteraction,
		client: Client,
		locale?: string
	): Promise<void>;
};

/**
 * Subcommand interface for slash commands
 * Represents a command that belongs to a parent command
 */
export type SubCommand = {
	/** The name of the parent command this subcommand belongs to */
	parent: string;
	/** The subcommand data including name, description, and options */
	data: SlashCommandSubcommandBuilder | LocalizedSlashCommandSubcommandBuilder;
	/**
	 * Subcommand execution handler
	 * @param interaction - The interaction object from Discord
	 * @param client - The bot client instance
	 * @param locale - The resolved locale string
	 * @returns Promise<void>
	 */
	execute(
		interaction: ChatInputCommandInteraction,
		client: Client,
		locale?: string
	): Promise<void>;
};

/**
 * Union type representing either a base command or a subcommand
 * Used for type checking and command handling
 */
export type Command = BaseCommand | SubCommand;
