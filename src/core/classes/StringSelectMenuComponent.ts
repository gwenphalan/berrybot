import { Client } from '../client/BerryClient';
import * as discord from 'discord.js';
import { createCustomId } from '@/core/utils/CustomIdUtils';

export interface StringSelectMenuBuildOptions<TData = unknown> {
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	options?: discord.APISelectMenuOption[];
	data: TData;
}

export abstract class StringSelectMenuComponent<TData = unknown> {
	abstract id: string;
	style?: never;
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	type: typeof discord.ComponentType.StringSelect = discord.ComponentType.StringSelect;
	parent?: string;
	group?: string;

	async build(
		client: Client,
		options?: StringSelectMenuBuildOptions<TData>,
		sessionId?: string
	): Promise<discord.StringSelectMenuBuilder> {
		const builder = new discord.StringSelectMenuBuilder();
		const placeholder = options?.placeholder ?? this.placeholder;
		const min_values = options?.min_values ?? this.min_values;
		const max_values = options?.max_values ?? this.max_values;
		const menuOptions = options?.options;

		if (placeholder) builder.setPlaceholder(placeholder);
		if (min_values !== undefined) builder.setMinValues(min_values);
		if (max_values !== undefined) builder.setMaxValues(max_values);
		if (menuOptions) builder.addOptions(menuOptions);

		let idString: string;
		if (this.parent && this.group) {
			idString = `${this.parent}:${this.group}:${this.id}`;
		} else if (this.parent) {
			idString = `${this.parent}:${this.id}`;
		} else {
			idString = this.id;
		}
		const customId = createCustomId(idString, {
			data: options?.data as Record<string, any>,
			sessionId,
		});
		builder.setCustomId(customId);
		return builder;
	}
}
