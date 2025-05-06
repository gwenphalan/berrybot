import {
	ChannelSelectMenuInteraction,
	PermissionFlagsBits,
	Collection,
	GuildBasedChannel,
} from 'discord.js';
import { ChannelSelectMenuComponent } from '@/core/classes/ChannelSelectMenuComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';

/**
 * ChannelSelectMenu - Selects a channel for the role message, single select
 * Handles channel select menu in role category edit menu
 * Note: Channel select menus do not take options; they filter by channel type.
 */
export class ChannelSelectMenu extends ChannelSelectMenuComponent<{
	channels: Collection<string, GuildBasedChannel>;
}> {
	id = 'channel-select';
	parent = 'roles';
	placeholder = 'Select a channel';
	min_values = 1;
	max_values = 1;
	static permissions = [PermissionFlagsBits.ManageRoles];

	async build(
		client: Client,
		options: { data: { channels: Collection<string, GuildBasedChannel> } }
	) {
		logger.debug({ data: options.data }, 'Building channel select menu component with data');
		const select = await super.build(client, {
			placeholder: this.placeholder,
			min_values: this.min_values,
			max_values: this.max_values,
			data: options.data,
		});
		// Channel select menus do not support addOptions; options are determined by Discord based on channel types.
		logger.debug('Channel Select select menu built successfully');
		return select;
	}

	async execute(
		interaction: ChannelSelectMenuInteraction,
		client: Client,
		selected: { label: string; value: string },
		data: Record<string, never>
	) {
		logger.debug({ data, selected }, 'Channel Select select menu clicked with data');
		// Add your flow or business logic here as needed
	}
}

export default ChannelSelectMenu;
