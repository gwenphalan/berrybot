import { ButtonInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent } from '@/core/classes/ButtonComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import { books } from '@/messages/paginator';

/**
 * PaginatorNextButton
 *
 * Button component for navigating to the next page in a paginated embed.
 * Extends the abstract ButtonComponent for type safety and builder integration.
 */
export class PaginatorNextButton extends ButtonComponent<{ id: string }> {
	/** Unique component ID for registration and customId generation */
	id = 'paginator.next';
	/** Button label */
	label = '►';
	/** Button style (Primary) */
	style = 1; // ButtonStyle.Primary
	/** Required permissions to use this button */
	static permissions = [PermissionFlagsBits.ManageRoles];

	/**
	 * Handles the button interaction to go to the next page.
	 * @param interaction - The ButtonInteraction from Discord.js
	 * @param _client - The BerryClient instance (unused)
	 * @param data - Data containing the paginator id
	 */
	async execute(interaction: ButtonInteraction, _client: Client, data: { id: string }) {
		logger.debug({ data }, 'paginator.next button clicked with data');
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

		// Calculate the new page index (next page, but not above max)
		const newPage = target + 1;
		logger.debug({ newPage, totalPages: pages.length }, 'Updating to next page');

		// Update the embed with the new page content and title
		await interaction.update({
			embeds: [
				new EmbedBuilder()
					.setColor(embed.color!)
					.setDescription(
						pages[
							target === pages.length
								? pages.length > 1
									? pages.length - 1
									: 0
								: target
						]
					)
					.setTitle(
						`${embed.title.split('[')[0]} [${
							target === pages.length
								? pages.length > 1
									? pages.length - 1
									: 1
								: target + 1
						}/${pages.length}]`
					),
			],
		});
	}
}

export default PaginatorNextButton;
