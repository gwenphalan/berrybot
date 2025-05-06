import * as discord from 'discord.js';
import { MessageBuilder, Client } from '@/core/interfaces';
import PaginatorBackButton from '@/components/buttons/paginator/back';
import PaginatorNextButton from '@/components/buttons/paginator/next';
import PaginatorCloseButton from '@/components/buttons/paginator/close';
import { Collection } from 'discord.js';
import { logger } from '@/core/logging/Logger';

export const books = new Collection<string, string[]>();

/**
 * Reusable message template with embed and components
 */
export const paginator: MessageBuilder = {
	embeds: [
		new discord.EmbedBuilder()
			.setTitle('Paginator')
			.setDescription('Loading...')
			.setColor('#00FFFF'), // BerryBot Aqua
	],
	components: [],
	async build(
		client: Client,
		id: string,
		pages: string[],
		title: string,
		options: {
			currentPage: number;
			color: string;
			ephemeral: boolean;
		}
	) {
		logger.debug({ id, pageCount: pages.length, title, options }, 'Building paginator message');

		// Register paginator in collection
		books.set(id, pages);
		logger.debug({ id, pageCount: pages.length }, 'Registered paginator in books collection');

		// Component data
		const backButtonData = { id };
		const nextButtonData = { id };
		logger.debug({ backButtonData, nextButtonData }, 'Prepared button data');

		// Build components using the new class-based system
		const backButton = await new PaginatorBackButton().build(client, backButtonData);
		const nextButton = await new PaginatorNextButton().build(client, nextButtonData);
		const closeButton = await new PaginatorCloseButton().build(client, undefined);

		logger.debug('Built all paginator buttons');

		// Add components to action row
		const actionRow = new discord.ActionRowBuilder<discord.ButtonBuilder>().addComponents(
			backButton,
			nextButton,
			closeButton
		);

		// Update embed
		this.embeds[0].setColor(options.color as discord.ColorResolvable);
		this.embeds[0].setDescription(pages[options.currentPage]);
		this.embeds[0].setTitle(`${title} [${options.currentPage + 1}/${pages.length}]`);

		logger.debug(
			{
				currentPage: options.currentPage + 1,
				totalPages: pages.length,
				title,
				color: options.color,
				ephemeral: options.ephemeral,
			},
			'Updated paginator embed'
		);

		return {
			embeds: this.embeds,
			components: [actionRow],
		};
	},
};
