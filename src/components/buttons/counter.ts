// TODO: Locale Migration
// keys:
//   button.counter.label: 'Click Me!'

import { ButtonInteraction } from 'discord.js';
import { ButtonComponent } from '@/core/classes/ButtonComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';

/**
 * Counter Button - Increments a counter in a flow
 * Handles button click to increment a counter
 */
export class CounterButton extends ButtonComponent<{ count: number }> {
	id = 'counter';
	style = 1; // ButtonStyle.Primary

	async build(
		client: Client,
		data?: { count: number },
		sessionId?: string,
		labelKey: string = 'button.counter.label',
		locale: string = 'en-US'
	) {
		// Use the translation key and locale for the label
		return super.build(client, data, sessionId, labelKey, locale);
	}

	async execute(interaction: ButtonInteraction, client: Client, data: { count: number }) {
		logger.debug(
			{
				messageId: interaction.message.id,
				currentCount: data.count,
			},
			'Counter button clicked'
		);

		// Let the flow system handle the interaction
		await client.flowManager.handleInteraction(interaction);

		throw new Error('Test error');
	}
}

export default CounterButton;
