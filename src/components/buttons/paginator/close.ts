// TODO: Locale Migration
// keys:
//   button.paginator.close.label: 'Close'

import { ButtonInteraction, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent } from '@/core/classes/ButtonComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';

/**
 * PaginatorCloseButton
 *
 * Button component for closing (deleting) the paginator message.
 * Extends the abstract ButtonComponent for type safety and builder integration.
 */
export class PaginatorCloseButton extends ButtonComponent<undefined> {
	/** Unique component ID for registration and customId generation */
	id = 'paginator.close';
	/** Button style (Danger) */
	style = 4; // ButtonStyle.Danger
	/** Required permissions to use this button */
	static permissions = [PermissionFlagsBits.ManageRoles];

	async build(client: Client, data?: undefined, sessionId?: string, locale: string = 'en-US') {
		return super.build(client, data, sessionId, 'button.paginator.close.label', locale);
	}

	/**
	 * Handles the button interaction to delete the paginator message.
	 * @param interaction - The ButtonInteraction from Discord.js
	 * @param _client - The BerryClient instance (unused)
	 */
	async execute(interaction: ButtonInteraction, _client: Client) {
		logger.debug('paginator.close button clicked');
		logger.debug({ messageId: interaction.message.id }, 'Deleting paginator message');
		await interaction.message.delete();
	}
}

export default PaginatorCloseButton;
