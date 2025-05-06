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
	label = 'Click Me!';
	style = 1; // ButtonStyle.Primary

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
	}
}

export default CounterButton;
