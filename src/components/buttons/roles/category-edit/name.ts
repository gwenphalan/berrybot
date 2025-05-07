// TODO: Locale Migration
// keys:
//   button.roles.category_edit.name.label: 'Name'

import { ButtonInteraction, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent } from '@/core/classes/ButtonComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import { RoleConfigFlow } from '@/flows/roles/RoleConfigFlow';
import { database } from '@/core/config/database';
import { toDiscordLocale, t } from '@/core/utils/Locale';

/**
 * Name Input - Triggers name input modal
 * Handles name button in role category edit menu
 */
export class CategoryEditNameButton extends ButtonComponent<{ category: string }> {
	id = 'name';
	group = 'category-edit';
	parent = 'roles';
	style = 2; // ButtonStyle.Secondary
	emoji = '✏️';
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
			'button.roles.category_edit.name.label',
			locale
		);
	}

	async execute(interaction: ButtonInteraction, client: Client, data: { category: string }) {
		const flow = client.flowManager.getHandler<RoleConfigFlow>(interaction.message.id);
		const userId = interaction.user?.id;
		let locale = 'en-US';
		if (userId) {
			const userSettings = await database.userSettings.get(userId);
			locale = toDiscordLocale(userSettings?.locale || interaction.locale || 'en-US');
		} else {
			locale = toDiscordLocale(interaction.locale || 'en-US');
		}
		logger.debug({ data }, this.id + ' button clicked with data');

		if (!flow) {
			logger.error('No flow found for message id', { messageId: interaction.message.id });
			await interaction.reply({
				content: t('roles.category_edit_name_button_error_no_flow', { locale }),
				ephemeral: true,
			});
			return;
		}

		flow.handle(interaction, client, data);
	}
}

export default CategoryEditNameButton;
