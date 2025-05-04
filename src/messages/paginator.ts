import * as discord from 'discord.js';
import { MessageBuilder } from '../interfaces';
import { Paginator_BackButton, Paginator_NextButton, Paginator_CloseButton } from '../components';
import { Collection } from 'discord.js';
import { logger } from '../util';

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
		client,
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
		const backButtonData = {
			id,
		};

		const nextButtonData = {
			id,
		};

		logger.debug({ backButtonData, nextButtonData }, 'Prepared button data');

		// Build components
		const backButton = await Paginator_BackButton.build(client, backButtonData);
		const nextButton = await Paginator_NextButton.build(client, nextButtonData);
		const closeButton = await Paginator_CloseButton.build(client);

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
