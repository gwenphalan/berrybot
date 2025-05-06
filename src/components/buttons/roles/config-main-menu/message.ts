import { ButtonInteraction, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent } from '@/core/classes/ButtonComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import { RoleConfigFlow } from '@/flows/roles/RoleConfigFlow';

/**
 * Send Message - Triggers message select menu
 * Handles message button in role category edit menu
 */
export class ConfigMainMenuMessageButton extends ButtonComponent<undefined> {
	id = 'roles:config-main-menu:message';
	label = 'Send Role Selection Message';
	style = 1; // ButtonStyle.Primary
	emoji = '📨';
	static permissions = [PermissionFlagsBits.ManageRoles];

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

export default ConfigMainMenuMessageButton;
