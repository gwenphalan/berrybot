// TODO: Locale Migration
// keys:
//   button.roles.config_main_menu.create.label: 'Create'

import { ButtonInteraction, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent } from '@/core/classes/ButtonComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import { RoleConfigFlow } from '@/flows/roles/RoleConfigFlow';

/**
 * Create Role Category - Triggers create role category modal
 * Handles create button in role category edit menu
 */
export class ConfigMainMenuCreateButton extends ButtonComponent<undefined> {
	id = 'roles:config-main-menu:create';
	style = 3; // ButtonStyle.Success
	emoji = '➕';
	static permissions = [PermissionFlagsBits.ManageRoles];

	async build(client: Client, data?: undefined, sessionId?: string, locale: string = 'en-US') {
		return super.build(
			client,
			data,
			sessionId,
			'button.roles.config_main_menu.create.label',
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

		flow.handle(interaction, client);
	}
}

export default ConfigMainMenuCreateButton;
