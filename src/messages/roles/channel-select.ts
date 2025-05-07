// TODO: Locale Migration
// keys:
//   channel_select.no_channels: 'No channels found for guild'

import { ActionRowBuilder, ChannelSelectMenuBuilder } from 'discord.js';
import { MessageBuilder } from '@/core/interfaces/MessageBuilder';
import { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import ChannelSelectMenu from '@/components/selectMenus/roles/channel-select';
import { t } from '@/core/utils/Locale';

/**
 * ChannelSelect - Message for selecting a channel in a role config flow
 */
export const ChannelSelect: MessageBuilder = {
	embeds: [],
	components: [],

	async build(
		client: Client,
		guildId: string,
		state?: any,
		sessionId?: string,
		locale: string = 'en-US'
	) {
		const guild = await client.guilds.fetch(guildId);
		const channels = guild
			? (guild.channels.cache as import('discord.js').Collection<
					string,
					import('discord.js').GuildBasedChannel
				>)
			: undefined;
		if (!channels) {
			logger.error('No channels found for guild', { guildId });
			return { embeds: [], components: [] };
		}

		// You may want to filter channels by type here if needed
		const select = await (new ChannelSelectMenu().build as any)(
			client,
			{ data: { channels } },
			sessionId,
			locale
		);
		const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(select);

		const message = {
			embeds: this.embeds,
			components: [row],
		};
		logger.debug({ message }, '[ChannelSelect.build] Built channel select message');
		return message;
	},
};

export default ChannelSelect;
