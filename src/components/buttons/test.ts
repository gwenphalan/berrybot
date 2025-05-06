import { ButtonInteraction, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent } from '@/core/classes/ButtonComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';

/**
 * Example button component for testing custom ID data handling
 */
export class TestButton extends ButtonComponent<{
	boolean: boolean;
	number: number;
	string: string;
	array: number[];
}> {
	id = 'test-button';
	label = 'Test Button';
	style = 1; // ButtonStyle.Primary
	static permissions = [PermissionFlagsBits.ManageEvents, PermissionFlagsBits.ManageRoles];

	async execute(
		interaction: ButtonInteraction,
		_client: Client,
		data: {
			boolean: boolean;
			number: number;
			string: string;
			array: number[];
		}
	) {
		// Log received data and respond to interaction
		logger.debug({ data }, 'Test button clicked with data');

		interaction.reply({
			content: `This is a test button!`,
			ephemeral: true,
		});
	}
}

export default TestButton;
