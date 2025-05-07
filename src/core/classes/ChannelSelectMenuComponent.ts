import { Client } from '../client/BerryClient';
import * as discord from 'discord.js';
import { t } from '@/core/utils/Locale';
import { ChannelSelectMenuComponent as IChannelSelectMenuComponent } from '@/core/interfaces/components/ChannelSelectMenu';

export interface ChannelSelectMenuBuildOptions<TData = unknown> {
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	channel_types?: discord.ChannelType[];
	data: TData;
}

export abstract class ChannelSelectMenuComponent<TData = unknown>
	implements IChannelSelectMenuComponent<TData>
{
	abstract id: string;
	style?: never;
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	channel_types?: discord.ChannelType[];
	type: typeof discord.ComponentType.ChannelSelect = discord.ComponentType.ChannelSelect;
	parent?: string;
	group?: string;

	/**
	 * Build the ChannelSelectMenuBuilder with the properties of this instance.
	 * @param client - The bot client instance.
	 * @param options - Optional build options.
	 * @param sessionId - Optional session ID for the component.
	 * @param placeholderKey - Optional translation key for the placeholder.
	 * @param locale - Optional locale string for localization.
	 */
	async build(
		client: Client,
		options?: ChannelSelectMenuBuildOptions<TData>,
		sessionId?: string,
		placeholderKey?: string,
		locale?: string
	): Promise<discord.ChannelSelectMenuBuilder> {
		let placeholder = options?.placeholder ?? this.placeholder;
		if (placeholderKey && locale) {
			placeholder = t(placeholderKey, { locale });
		}
		const min_values = options?.min_values ?? this.min_values;
		const max_values = options?.max_values ?? this.max_values;
		const channel_types = options?.channel_types ?? this.channel_types;

		const builder = new discord.ChannelSelectMenuBuilder();
		if (placeholder) builder.setPlaceholder(placeholder);
		if (min_values !== undefined) builder.setMinValues(min_values);
		if (max_values !== undefined) builder.setMaxValues(max_values);
		if (channel_types) builder.setChannelTypes(channel_types);

		let idString: string;
		if (this.parent && this.group) {
			idString = `${this.parent}:${this.group}:${this.id}`;
		} else if (this.parent) {
			idString = `${this.parent}:${this.id}`;
		} else {
			idString = this.id;
		}
		const customId = client.utils.CustomId.createCustomId(idString, {
			data: options?.data as Record<string, any>,
			sessionId,
		});
		builder.setCustomId(customId);
		return builder;
	}
}
