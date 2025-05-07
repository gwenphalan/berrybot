// TODO: Locale Migration
// keys:
//   button.roles.category_edit.roles.label: 'Roles'

import { ButtonInteraction, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent } from '@/core/classes/ButtonComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import { RoleConfigFlow } from '@/flows/roles/RoleConfigFlow';

/**
 * Roles Select - Triggers roles select menu
 * Handles roles button in role category edit menu
 */
export class CategoryEditRolesButton extends ButtonComponent<{ category: string }> {
	id = 'roles';
	group = 'category-edit';
	parent = 'roles';
	style = 2; // ButtonStyle.Secondary
	emoji = '🎨';
	static permissions = [PermissionFlagsBits.ManageRoles];

	async build(
		client: Client,
		data?: { category: string },
		sessionId?: string,
		locale: string = 'en-US'
	) {
		return super.build(
			client,
			data,
			sessionId,
			'button.roles.category_edit.roles.label',
			locale
		);
	}

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

export default CategoryEditRolesButton;
