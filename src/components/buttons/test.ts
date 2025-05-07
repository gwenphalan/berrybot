// TODO: Locale Migration
// keys:
//   button.test.label: 'Test Button'
//   button.test.reply: 'This is a test button!'

import { ButtonInteraction, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent } from '@/core/classes/ButtonComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import { t } from '@/core/utils/Locale';

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
	style = 1; // ButtonStyle.Primary
	static permissions = [PermissionFlagsBits.ManageEvents, PermissionFlagsBits.ManageRoles];

	async build(client: Client, data?: any, sessionId?: string, locale: string = 'en-US') {
		return super.build(client, data, sessionId, 'button.test.label', locale);
	}

	async execute(
		interaction: ButtonInteraction,
		_client: Client,
		data: {
			boolean: boolean;
			number: number;
			string: string;
			array: number[];
		},
		locale: string = 'en-US'
	) {
		// Log received data and respond to interaction
		logger.debug({ data }, 'Test button clicked with data');

		interaction.reply({
			content: t('button.test.reply', { locale }),
			ephemeral: true,
		});
	}
}

export default TestButton;
