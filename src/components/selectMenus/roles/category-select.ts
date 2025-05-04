import { StringSelectMenuBuilder, PermissionFlagsBits } from 'discord.js';
import {
	SelectMenuComponent,
	ComponentTypes,
	SingleSelectMenuComponent,
} from '@/interfaces/MessageComponent';
import { logger } from '@/util';

/**
 * Category Select - Selects a category for the role message, single select
 * Handles category selection in role configuration
 */
export const MessageComponent: SingleSelectMenuComponent = {
	id: 'roles:category-select',
	type: ComponentTypes.SelectMenu,
	permissions: [PermissionFlagsBits.ManageRoles],
	multi_select: false,

	async build(client, data: { categories: string[] }) {
		logger.debug({ data }, 'Building select menu component with data');

		const select = new StringSelectMenuBuilder()
			.setCustomId(await client.getCustomID(this.id, {}))
			.setPlaceholder('Select a category')
			.setMinValues(1)
			.setMaxValues(1);

		if (!data.categories || data.categories.length === 0) {
			// If no categories exist, disable the select menu and show a message
			select
				.setDisabled(true)
				.setPlaceholder('No categories available')
				.addOptions([
					{
						label: 'No categories available',
						value: 'none',
						description: 'Create a category first',
					},
				]);
		} else {
			// Add category options
			data.categories.forEach((category) => {
				select.addOptions({
					label: category,
					value: category,
				});
			});
		}

		logger.debug('Category Select select menu built successfully');
		return select;
	},

	async execute(interaction, client, selected, data: Record<string, never>) {
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

		const category = guildSettings.selfRoles?.categories.find((c) => c.name === selected.value);

		flow?.handle(interaction, client, {
			category: category,
		});
	},
};

export default MessageComponent;
