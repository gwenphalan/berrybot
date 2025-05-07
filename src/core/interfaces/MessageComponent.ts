import { Client } from '@/core/client/BerryClient';
import * as discord from 'discord.js';

/**
 * Supported Discord.js component builder types for v14+.
 */
export type ComponentBuilder =
	| discord.ButtonBuilder
	| discord.StringSelectMenuBuilder
	| discord.UserSelectMenuBuilder
	| discord.RoleSelectMenuBuilder
	| discord.ChannelSelectMenuBuilder
	| discord.MentionableSelectMenuBuilder
	| discord.ModalBuilder;

/**
 * Supported Discord.js interaction types for components.
 */
export type ComponentInteraction =
	| discord.ButtonInteraction
	| discord.StringSelectMenuInteraction
	| discord.UserSelectMenuInteraction
	| discord.RoleSelectMenuInteraction
	| discord.ChannelSelectMenuInteraction
	| discord.MentionableSelectMenuInteraction
	| discord.ModalSubmitInteraction;

/**
 * Base interface for all message components (generic for typed custom ID data).
 * All specific component interfaces should extend this.
 * @template TData - The type of data extracted from the custom ID (if any).
 */
export interface BaseMessageComponent<TData = any> {
	/** Unique identifier for the component (used in customId). */
	id: string;
	parent?: string;
	group?: string;
	/**
	 * Optional: Whether the component is disabled.
	 */
	disabled?: boolean;
	/**
	 * Optional: Emoji to display on the component (string or Emoji object).
	 */
	emoji?: string | discord.APIEmoji;
	/**
	 * Optional: Standardized style (for buttons, select menus, etc.).
	 */
	style?: any; // Use specific enums in concrete interfaces
	/**
	 * Optional: Whether the select menu allows multiple selections (only for select menus).
	 */
	multi_select?: boolean;
	/**
	 * Optional: Required permissions to use this component.
	 */
	permissions?: bigint[];
	/**
	 * Optional: Whether this component is restricted to developers only.
	 */
	developer?: boolean;
	/**
	 * Handles the component interaction.
	 * @param interaction - The interaction object from Discord.
	 * @param client - The bot client instance.
	 * @param data - Optional data parsed from the custom ID (typed).
	 * @param guild - Optional guild where the interaction occurred.
	 * @param response - Optional modal response data.
	 * @param selected - Optional selected options for select menus.
	 */
	execute(
		interaction: ComponentInteraction,
		client: Client,
		data?: TData,
		guild?: discord.Guild,
		response?: discord.Collection<string, discord.TextInputComponent>,
		selected?: discord.APISelectMenuOption | discord.APISelectMenuOption[]
	): Promise<void>;
	/**
	 * Builds the component for Discord (fluent builder pattern recommended in implementation).
	 * @param client - The bot client instance.
	 * @param args - Additional arguments for component construction.
	 * @param locale - Optional locale string for localization.
	 * @returns Promise resolving to the built component.
	 */
	build(client: Client, ...args: any[]): Promise<ComponentBuilder>;
	/**
	 * Optional: Handle errors that occur during interaction execution.
	 * @param error - The error thrown.
	 * @param interaction - The interaction object.
	 * @param client - The bot client instance.
	 */
	onError?(error: Error, interaction: ComponentInteraction, client: Client): Promise<void>;
}
