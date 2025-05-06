import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { MessageBuilder } from '@/core/interfaces/MessageBuilder';
import { Client } from '@/core/client/BerryClient';
import { FlowState } from '@/core/interfaces/Flow';
import { logger } from '@/core/logging/Logger';
import { Roles_CategorySelect } from '@/components';

/**
 * CategorySelect - Message Description
 * Builds a message with CategorySelect functionality
 */
export const CategorySelect: MessageBuilder = {
	// Default embeds for the message
	embeds: [
		new EmbedBuilder().setTitle('What category would you like to edit?').setColor('#00BFFF'),
	],

	// Default components for the message
	components: [],

	/**
	 * Builds or updates the message content
	 * @param client - The Discord client instance
	 * @param state - The current flow state (if used in a flow)
	 * @param options - Additional options for building the message
	 */
	async build(client: Client, guildId: string, _state?: FlowState) {
		const guildSettings =
			guildId && guildId !== undefined
				? await client.database.guildSettings.get(guildId)
				: null;
		const categories: string[] = [];

		guildSettings?.selfRoles.categories.forEach((category) => {
			categories.push(category.name);
		});

		const select = await Roles_CategorySelect.build(client, { categories: categories });
		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

		// Return updated message
		const message = {
			embeds: this.embeds,
			components: [row],
		};
		logger.debug({ message }, 'Built messageName message');
		return message;
	},
};

export default CategorySelect;
