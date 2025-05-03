import { ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '../../../interfaces/MessageComponent';
import { logger } from '../../../util';
import { books } from '../../../messages/paginator';

export const MessageComponent: ButtonComponent = {
	id: 'paginator.back',
	type: ComponentTypes.Button,
	permissions: [PermissionFlagsBits.ManageRoles],

	async build(client, data: { id: string }) {
		logger.debug({ data }, 'Building paginator.back button component with data');

		const button = new ButtonBuilder()
			.setCustomId(
				await client.getCustomID(this.id, {
					id: data.id,
				})
			)
			.setLabel('◄')
			.setStyle(ButtonStyle.Primary);

		logger.debug('paginator.back button built successfully');
		return button;
	},

	async execute(interaction, _client, data: { id: string }) {
		logger.debug({ data }, 'paginator.back button clicked with data');
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
		const newPage = target - 1;
		logger.debug({ newPage, totalPages: pages.length }, 'Updating to previous page');
		interaction.update({
			embeds: [
				new EmbedBuilder()
					.setColor(embed.color)
					.setDescription(pages[target === 1 ? 0 : target - 1])
					.setTitle(
						`${embed.title.split('[')[0]} [${target === 1 ? 1 : target - 1}/${pages.length}]`
					),
			],
		});
	},
};

export default MessageComponent;
