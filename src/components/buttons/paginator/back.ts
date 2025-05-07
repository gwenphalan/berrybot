// TODO: Locale Migration
// keys:
//   button.paginator.back.label: '◄'

import { ButtonInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent } from '@/core/classes/ButtonComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import { books } from '@/messages/paginator';

/**
 * PaginatorBackButton
 *
 * Button component for navigating to the previous page in a paginated embed.
 * Extends the abstract ButtonComponent for type safety and builder integration.
 */
export class PaginatorBackButton extends ButtonComponent<{ id: string }> {
	/** Unique component ID for registration and customId generation */
	id = 'paginator.back';
	style = 1; // ButtonStyle.Primary
	static permissions = [PermissionFlagsBits.ManageRoles];

	async build(
		client: Client,
		data?: { id: string },
		sessionId?: string,
		locale: string = 'en-US'
	) {
		return super.build(client, data, sessionId, 'button.paginator.back.label', locale);
	}

	/**
	 * Handles the button interaction to go to the previous page.
	 * @param interaction - The ButtonInteraction from Discord.js
	 * @param _client - The BerryClient instance (unused)
	 * @param data - Data containing the paginator id
	 */
	async execute(interaction: ButtonInteraction, _client: Client, data: { id: string }) {
		logger.debug({ data }, 'paginator.back button clicked with data');
		const embed = interaction.message.embeds[0];
		logger.debug({ embedTitle: embed?.title }, 'Current embed title');

		// Retrieve the pages array for this paginator
		const pages = books.get(data.id);
		logger.debug({ pageCount: pages?.length }, 'Retrieved pages from books collection');
		if (!pages) return;

		// Parse the current page number from the embed title
		if (!embed?.title) return;
		const matches = embed.title.match(/\[(\d+)\/\d+\]/g);
		logger.debug({ matches }, 'Title regex matches');
		if (!matches) return;
		const lastMatch = matches[matches.length - 1];
		const target = parseInt(lastMatch.match(/\d+/)?.[0] ?? '0');
		logger.debug({ target }, 'Parsed target page number');
		if (isNaN(target)) return;

		// Calculate the new page index (previous page, but not below 0)
		const newPage = target - 1;
		logger.debug({ newPage, totalPages: pages.length }, 'Updating to previous page');

		// Update the embed with the new page content and title
		await interaction.update({
			embeds: [
				new EmbedBuilder()
					.setColor(embed.color!)
					.setDescription(pages[target === 1 ? 0 : target - 1])
					.setTitle(
						`${embed.title.split('[')[0]} [${target === 1 ? 1 : target - 1}/${pages.length}]`
					),
			],
		});
	}
}

export default PaginatorBackButton;
