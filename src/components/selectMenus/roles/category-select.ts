import { StringSelectMenuInteraction, PermissionFlagsBits } from 'discord.js';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import { StringSelectMenuComponent } from '@/core/classes/StringSelectMenuComponent';

/**
 * CategorySelectMenu - Selects a category for the role message, single select
 * Handles category selection in role configuration
 */
export class CategorySelectMenu extends StringSelectMenuComponent<{ categories: string[] }> {
	id = 'category-select';
	parent = 'roles';
	placeholder = 'Select a category';
	min_values = 1;
	max_values = 1;
	static permissions = [PermissionFlagsBits.ManageRoles];

	async build(client: Client, options: { data: { categories: string[] } }) {
		logger.debug({ data: options.data }, 'Building category select menu component with data');
		const select = await super.build(client, {
			placeholder: this.placeholder,
			min_values: this.min_values,
			max_values: this.max_values,
			data: options.data,
		});

		if (!options.data.categories || options.data.categories.length === 0) {
			select.setDisabled(true).setPlaceholder('No categories available').addOptions({
				label: 'No categories available',
				value: 'none',
				description: 'Create a category first',
			});
		} else {
			options.data.categories.forEach((category) => {
				select.addOptions({
					label: category,
					value: category,
				});
			});
		}
		logger.debug('Category Select select menu built successfully');
		return select;
	}

	async execute(
		interaction: StringSelectMenuInteraction,
		client: Client,
		selected: { label: string; value: string },
		data: Record<string, never>
	) {
		const flow = client.flowManager.getHandler(interaction.message.id);
		logger.debug({ data, selected }, 'Category Select select menu clicked with data');
		if (!interaction.guildId) {
			logger.error('Guild ID not found');
			return;
		}
		const guildSettings = await client.database.guildSettings.get(interaction.guildId);
		if (!guildSettings) {
			logger.error('Guild settings not found');
			return;
		}

		const category = guildSettings.selfRoles?.categories.find(
			(c: any) => c.name === selected.value
		);

		flow?.handle(interaction, client, {
			category: category,
		});
	}
}

export default CategorySelectMenu;
