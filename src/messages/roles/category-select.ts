import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { MessageBuilder } from '@/core/interfaces/MessageBuilder';
import { Client } from '@/core/client/BerryClient';
import { FlowState } from '@/core/interfaces/Flow';
import { logger } from '@/core/logging/Logger';
import CategorySelectMenu from '@/components/selectMenus/roles/category-select';

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
	 * @param sessionId - Optional sessionId for flow-attached messages
	 */
	async build(client: Client, guildId: string, _state?: FlowState, sessionId?: string) {
		const guildSettings =
			guildId && guildId !== undefined
				? await client.database.guildSettings.get(guildId)
				: null;
		const categories: string[] = [];

		guildSettings?.selfRoles.categories.forEach((category) => {
			categories.push(category.name);
		});

		const select = await (new CategorySelectMenu().build as any)(
			client,
			{ data: { categories } },
			sessionId
		);
		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

		// Return updated message
		const message = {
			embeds: this.embeds,
			components: [row],
		};
		logger.debug({ message }, '[CategorySelect.build] Built category select message');
		return message;
	},
};

export default CategorySelect;
