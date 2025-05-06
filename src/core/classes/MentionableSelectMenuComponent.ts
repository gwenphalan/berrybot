import { Client } from '../client/BerryClient';
import * as discord from 'discord.js';

export interface MentionableSelectMenuBuildOptions<TData = unknown> {
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	data: TData;
}

export abstract class MentionableSelectMenuComponent<TData = unknown> {
	abstract id: string;
	style?: never;
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	type: typeof discord.ComponentType.MentionableSelect = discord.ComponentType.MentionableSelect;
	parent?: string;
	group?: string;

	async build(
		client: Client,
		options?: MentionableSelectMenuBuildOptions<TData>
	): Promise<discord.MentionableSelectMenuBuilder> {
		const builder = new discord.MentionableSelectMenuBuilder();
		const placeholder = options?.placeholder ?? this.placeholder;
		const min_values = options?.min_values ?? this.min_values;
		const max_values = options?.max_values ?? this.max_values;

		if (placeholder) builder.setPlaceholder(placeholder);
		if (min_values !== undefined) builder.setMinValues(min_values);
		if (max_values !== undefined) builder.setMaxValues(max_values);

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
