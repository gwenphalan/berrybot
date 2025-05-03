import * as discord from 'discord.js';
import { MessageBuilder } from '../interfaces';
import { buttons } from '../components';
import { Collection } from 'discord.js';

export const paginators = new Collection<string, string[]>();

/**
 * Reusable message template with embed and components
 */
export const Paginator: MessageBuilder = {
	embeds: [
		new discord.EmbedBuilder().setTitle('').setDescription('').setColor('#00FFFF'), // BerryBot Aqua
	],
	components: [],
	async build(
		client,
		id: string,
		pages: string[],
		title: string,
		currentPage: number = 0,
		color: string = '#00FFFF'
	) {
		// Register paginator in collection
		paginators.set(id, pages);

		// Component data
		const backButtonData = {
			id,
			target: currentPage - 1,
		};

		const nextButtonData = {
			id,
			target: currentPage + 1,
		};

		// Build components
		const backButton = await buttons.Paginator.BackButton.build(client, backButtonData);
		const nextButton = await buttons.Paginator.NextButton.build(client, nextButtonData);
		const closeButton = await buttons.Paginator.CloseButton.build(client);

		// Add components to action row
		const actionRow = new discord.ActionRowBuilder<discord.ButtonBuilder>().addComponents(
			backButton,
			nextButton,
			closeButton
		);

		// Update embed
		this.embeds[0].setColor(color as discord.ColorResolvable);
		this.embeds[0].setDescription(pages[currentPage]);
		this.embeds[0].setTitle(title);

		return {
			embeds: this.embeds,
			components: [actionRow],
		};
	},
};
