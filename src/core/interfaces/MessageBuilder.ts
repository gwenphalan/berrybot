import * as discord from 'discord.js';
import type { Client } from '@/core/client/BerryClient';

/**
 * Interface for building Discord messages with embeds and components
 * Provides a structured way to create rich, interactive messages
 */
export interface MessageBuilder {
	/** Array of embeds to be included in the message */
	embeds: discord.EmbedBuilder[];
	/** Array of action rows containing buttons and select menus */
	components: discord.ActionRowBuilder<discord.ButtonBuilder | discord.StringSelectMenuBuilder>[];
	/**
	 * Builds the final message options
	 * @param client - The bot client instance
	 * @param args - Additional arguments needed for message construction
	 * @returns Promise resolving to the final message options
	 * @example
	 * // Building a message with embeds and buttons:
	 * const message = await builder.build(client, { title: "Welcome", description: "Hello!" });
	 */
	build(client: Client, ...args: any): Promise<discord.BaseMessageOptions>;
}
