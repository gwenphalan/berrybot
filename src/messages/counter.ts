import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { MessageBuilder } from '@/core/interfaces/MessageBuilder';
import { Client } from '@/core/client/BerryClient';
import { FlowState } from '@/core/interfaces/Flow';
import { logger } from '@/core/logging/Logger';
import CounterButton from '@/components/buttons/counter';

export const CounterMessage: MessageBuilder = {
	embeds: [
		new EmbedBuilder()
			.setTitle('Simple Counter')
			.setDescription('Click the button below to increment the counter!')
			.addFields([
				{
					name: 'Count',
					value: '0',
					inline: true,
				},
			]),
	],

	components: [],

	async build(client: Client, state: FlowState, sessionId?: string) {
		logger.debug({ state }, '[CounterMessage.build] Building counter message');

		// Get current count from state
		const count = state.data?.count || 0;
		logger.debug({ count }, '[CounterMessage.build] Current count');

		// Update embed with current count
		const embed = new EmbedBuilder()
			.setTitle('Simple Counter')
			.setDescription('Click the button below to throw an error!')
			.addFields([
				{
					name: 'Error Count',
					value: count.toString(),
					inline: true,
				},
			]);

		// Create button using the new class-based system
		const button = await new CounterButton().build(client, { count }, sessionId);
		logger.debug({ button }, '[CounterMessage.build] Built counter button');

		// Create action row with button
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
		logger.debug({ row }, '[CounterMessage.build] Created action row');

		// Return updated message
		const message = {
			embeds: [embed],
			components: [row],
		};
		logger.debug({ message }, '[CounterMessage.build] Built counter message');
		return message;
	},
};
