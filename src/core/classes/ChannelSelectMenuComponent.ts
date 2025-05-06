import { Client } from '../client/BerryClient';
import * as discord from 'discord.js';

export interface ChannelSelectMenuBuildOptions<TData = unknown> {
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	channel_types?: discord.ChannelType[];
	data: TData;
}

export abstract class ChannelSelectMenuComponent<TData = unknown> {
	abstract id: string;
	style?: never;
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	channel_types?: discord.ChannelType[];
	type: typeof discord.ComponentType.ChannelSelect = discord.ComponentType.ChannelSelect;
	parent?: string;
	group?: string;

	async build(
		client: Client,
		options?: ChannelSelectMenuBuildOptions<TData>
	): Promise<discord.ChannelSelectMenuBuilder> {
		const builder = new discord.ChannelSelectMenuBuilder();
		const placeholder = options?.placeholder ?? this.placeholder;
		const min_values = options?.min_values ?? this.min_values;
		const max_values = options?.max_values ?? this.max_values;
		const channel_types = options?.channel_types ?? this.channel_types;

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
		const customId = client.getCustomID(idString, options?.data);
		builder.setCustomId(customId);
		return builder;
	}
}
