// TODO: Locale Migration
// keys:
//   select.role.placeholder: 'Select roles'

import { StringSelectMenuInteraction, Collection } from 'discord.js';
import { StringSelectMenuComponent } from '@/core/classes/StringSelectMenuComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import { t } from '@/core/utils/Locale';

/**
 * RoleSelectMenu - Selects a role for the role message, and edit category roles
 * Handles role select menu in role category edit menu
 */
export class RoleSelectMenu extends StringSelectMenuComponent<{
	roles: Collection<string, string>;
	action: 'select' | 'edit';
}> {
	id = 'role-select';
	parent = 'roles';
	min_values = 1;
	max_values = 25;

	async build(
		client: Client,
		options: { data: { roles: Collection<string, string>; action: 'select' | 'edit' } },
		sessionId?: string,
		locale: string = 'en-US'
	) {
		const placeholderKey = 'select.role.placeholder';
		const placeholder = t(placeholderKey, { locale });
		logger.debug({ data: options.data }, 'Building role select menu component with data');
		const select = await super.build(
			client,
			{
				placeholder,
				min_values: this.min_values,
				max_values: options.data.roles.size,
				data: options.data,
			},
			sessionId,
			placeholderKey,
			locale
		);

		options.data.roles.forEach((val, key) => {
			select.addOptions({
				label: val,
				value: key,
			});
		});
		logger.debug('Role Select select menu built successfully');
		return select;
	}

	async execute(
		interaction: StringSelectMenuInteraction,
		client: Client,
		selected: { label: string; value: string },
		data?: Record<string, never>
	) {
		logger.debug({ data, selected }, 'Role select menu clicked with data');
		// Add your flow or business logic here as needed
	}
}

export default RoleSelectMenu;
