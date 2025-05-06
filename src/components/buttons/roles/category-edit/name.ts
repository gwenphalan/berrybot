import { ButtonInteraction, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent } from '@/core/classes/ButtonComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import { RoleConfigFlow } from '@/flows/roles/RoleConfigFlow';

/**
 * Name Input - Triggers name input modal
 * Handles name button in role category edit menu
 */
export class CategoryEditNameButton extends ButtonComponent<{ category: string }> {
	id = 'name';
	group = 'category-edit';
	parent = 'roles';
	label = 'Name';
	style = 2; // ButtonStyle.Secondary
	emoji = '✏️';
	static permissions = [PermissionFlagsBits.ManageRoles];

	async execute(interaction: ButtonInteraction, client: Client, data: { category: string }) {
		const flow = client.flowManager.getHandler<RoleConfigFlow>(interaction.message.id);
		logger.debug({ data }, this.id + ' button clicked with data');

		if (!flow) {
			logger.error('No flow found for message id', { messageId: interaction.message.id });
			return;
		}

		flow.handle(interaction, client, data);
	}
}

export default CategoryEditNameButton;
