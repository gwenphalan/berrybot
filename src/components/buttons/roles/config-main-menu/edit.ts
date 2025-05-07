// TODO: Locale Migration
// keys:
//   button.roles.config_main_menu.edit.label: 'Edit'

import { ButtonInteraction, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent } from '@/core/classes/ButtonComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import { RoleConfigFlow } from '@/flows/roles/RoleConfigFlow';

/**
 * Edit Role Category - Triggers select menu for role categories to edit
 * Handles edit button in role category edit menu
 */
export class ConfigMainMenuEditButton extends ButtonComponent<undefined> {
	id = 'roles:config-main-menu:edit';
	style = 2; // ButtonStyle.Secondary
	emoji = '✏️';
	static permissions = [PermissionFlagsBits.ManageRoles];

	async build(client: Client, data?: undefined, sessionId?: string, locale: string = 'en-US') {
		return super.build(
			client,
			data,
			sessionId,
			'button.roles.config_main_menu.edit.label',
			locale
		);
	}

	async execute(interaction: ButtonInteraction, client: Client) {
		const flow = client.flowManager.getHandler<RoleConfigFlow>(interaction.message.id);
		logger.debug(this.id + ' button clicked');

		if (!flow) {
			logger.error('No flow found for message id', { messageId: interaction.message.id });
			return;
		}

		await flow.handle(interaction, client);
	}
}

export default ConfigMainMenuEditButton;
