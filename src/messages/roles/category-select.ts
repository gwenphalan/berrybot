// TODO: Locale Migration
// keys:
//   category_select.title: 'What category would you like to edit?'

import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { MessageBuilder } from '@/core/interfaces/MessageBuilder';
import { Client } from '@/core/client/BerryClient';
import { FlowState } from '@/core/interfaces/Flow';
import { logger } from '@/core/logging/Logger';
import CategorySelectMenu from '@/components/selectMenus/roles/category-select';
import { t } from '@/core/utils/Locale';
import { database } from '@/core/config/database';
import { toDiscordLocale } from '@/core/utils/Locale';

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

		// Determine locale: user DB preference > interaction.locale > 'en-US'
		let resolvedLocale = locale;
		const userId = state?.interaction?.user?.id;
		if (userId) {
			const userSettings = await database.userSettings.get(userId);
			resolvedLocale = toDiscordLocale(
				userSettings?.locale || state?.interaction?.locale || 'en-US'
			);
		} else {
			resolvedLocale = toDiscordLocale(state?.interaction?.locale || 'en-US');
		}
		const title = t('category_select.title', { locale: resolvedLocale });

		const select = await (new CategorySelectMenu().build as any)(
			client,
			{ data: { categories } },
			sessionId,
			resolvedLocale
		);
		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

		// Return updated message
		const message = {
			embeds: [new EmbedBuilder().setTitle(title).setColor('#00BFFF')],
			components: [row],
		};
		logger.debug({ message }, '[CategorySelect.build] Built category select message');
		return message;
	},
};

export default CategorySelect;
