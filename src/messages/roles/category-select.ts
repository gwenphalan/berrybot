// TODO: Locale Migration Complete
// keys:
//   category_select.title: 'What category would you like to edit?'

import {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ContainerBuilder,
	TextDisplayBuilder,
} from 'discord.js';
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
	embeds: [],

	// Default components for the message
	components: [],

	/**
	 * Builds or updates the message content
	 * @param client - The Discord client instance
	 * @param state - The current flow state (if used in a flow)
	 * @param options - Additional options for building the message
	 * @param sessionId - Optional sessionId for flow-attached messages
	 */
	async build(
		client: Client,
		guildId: string,
		state?: FlowState,
		sessionId?: string,
		locale: string = 'en-US'
	) {
		const guildSettings =
			guildId && guildId !== undefined
				? await client.database.guildSettings.get(guildId)
				: null;
		const categories: string[] = [];

		guildSettings?.selfRoles.categories.forEach((category) => {
			categories.push(category.name);
		});

		const container = new ContainerBuilder().setAccentColor(
			client.utils.Color.hexToNumber('#00BFFF')
		);

		const title = new TextDisplayBuilder().setContent(
			client.getTranslation('category_select.title', locale)
		);
		container.addTextDisplayComponents(title);

		const select = await (new CategorySelectMenu().build as any)(
			client,
			{ data: { categories } },
			sessionId,
			locale
		);
		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

		container.addActionRowComponents(row);

		// Return updated message
		const message = {
			components: [container],
		};
		logger.debug({ message }, '[CategorySelect.build] Built category select message');
		return message;
	},
};

export default CategorySelect;
