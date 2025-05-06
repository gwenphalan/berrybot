import { StringSelectMenuBuilder, Collection } from 'discord.js';
import { SelectMenuComponent, ComponentTypes } from '@/core/interfaces/MessageComponent';
import { logger } from '@/core/logging/Logger';

/**
 * Role Select - Selects a role for the role message, and edit category roles
 * Handles role select menu in role category edit menu
 */
export const MessageComponent: SelectMenuComponent = {
	id: 'roles:role-select',
	type: ComponentTypes.SelectMenu,
	multi_select: true,

	async build(client, data: { roles: Collection<string, string>; action: 'select' | 'edit' }) {
		logger.debug({ data }, 'Building  select menu component with data');

		const select = new StringSelectMenuBuilder()
			.setCustomId(await client.getCustomID(this.id, {}))
			.setPlaceholder('')
			.setMinValues(1)
			.setMaxValues(data.roles.size);

		data.roles.forEach((val, key) => {
			select.addOptions({
				label: val,
				value: key,
			});
		});
		logger.debug('Role Select select menu built successfully');
		return select;
	},

	async execute(interaction, client, selected, data?: Record<string, never>) {
		logger.debug({ data, selected }, ' select menu clicked with data');
	},
};

export default MessageComponent;
