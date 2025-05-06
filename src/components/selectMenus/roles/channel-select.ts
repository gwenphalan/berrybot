import { StringSelectMenuBuilder, PermissionFlagsBits, Collection } from 'discord.js';
import { ComponentTypes, SingleSelectMenuComponent } from '@/core/interfaces/MessageComponent';
import { logger } from '@/core/logging/Logger';

/**
 * Channel Select - Selects a channel for the role message, single select
 * Handles channel select menu in role category edit menu
 */
export const MessageComponent: SingleSelectMenuComponent = {
	id: 'roles:channel-select',
	type: ComponentTypes.SelectMenu,
	permissions: [PermissionFlagsBits.ManageRoles],
	multi_select: false,

	async build(client, data: { channels: Collection<string, string> }) {
		logger.debug({ data }, 'Building  select menu component with data');

		const select = new StringSelectMenuBuilder()
			.setCustomId(await client.getCustomID(this.id, {}))
			.setPlaceholder('')
			.setMinValues(1)
			.setMaxValues(1);

		data.channels.forEach((val, key) => {
			select.addOptions({
				label: val,
				value: key,
			});
		});

		logger.debug('Channel Select select menu built successfully');
		return select;
	},

	async execute(interaction, _client, selected, data: Record<string, never>) {
		logger.debug({ data, selected }, 'Channel Select select menu clicked with data');
	},
};

export default MessageComponent;
