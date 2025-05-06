import { ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '@/core/interfaces/MessageComponent';
import { logger } from '@/core/logging/Logger';
import { books } from '@/messages/paginator';

export const MessageComponent: ButtonComponent = {
	id: 'paginator.next',
	type: ComponentTypes.Button,
	permissions: [PermissionFlagsBits.ManageRoles],

	async build(client, data: { id: string }) {
		logger.debug({ data }, 'Building paginator.next button component with data');

		const button = new ButtonBuilder()
			.setCustomId(
				await client.getCustomID(this.id, {
					id: data.id,
				})
			)
			.setLabel('►')
			.setStyle(ButtonStyle.Primary);

		logger.debug('paginator.next button built successfully');
		return button;
	},

	async execute(interaction, _client, data: { id: string }) {
		logger.debug({ data }, 'paginator.next button clicked with data');
		const embed = interaction.message.embeds[0];
		logger.debug({ embedTitle: embed?.title }, 'Current embed title');

		// Get the pages from the paginator
		const pages = books.get(data.id);
		logger.debug({ pageCount: pages?.length }, 'Retrieved pages from books collection');
		if (!pages) return;

		// Parse the target from the embed title
		if (!embed?.title) return;
		const matches = embed.title.match(/\[(\d+)\/\d+\]/g);
		logger.debug({ matches }, 'Title regex matches');
		if (!matches) return;

		// Get the last match which should be the current page
		const lastMatch = matches[matches.length - 1];
		const target = parseInt(lastMatch.match(/\d+/)?.[0] ?? '0');
		logger.debug({ target }, 'Parsed target page number');
		if (isNaN(target)) return;

		// Update the embed with new page and title
		const newPage = target + 1;
		logger.debug({ newPage, totalPages: pages.length }, 'Updating to next page');
		interaction.update({
			embeds: [
				new EmbedBuilder()
					.setColor(embed.color)
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
						`${embed.title.split('[')[0]} [${target === pages.length ? (pages.length > 1 ? pages.length - 1 : 1) : target + 1}/${pages.length}]`
					),
			],
		});
	},
};

export default MessageComponent;
