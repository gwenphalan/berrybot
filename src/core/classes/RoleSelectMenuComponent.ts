import { Client } from '../client/BerryClient';
import * as discord from 'discord.js';
import { createCustomId } from '@/core/utils/CustomIdUtils';

export interface RoleSelectMenuBuildOptions<TData = unknown> {
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	default_roles?: string[];
	data: TData;
}

export abstract class RoleSelectMenuComponent<TData = unknown> {
	abstract id: string;
	style?: never;
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	default_roles?: string[];
	type: typeof discord.ComponentType.RoleSelect = discord.ComponentType.RoleSelect;
	parent?: string;
	group?: string;

	async build(
		client: Client,
		options?: RoleSelectMenuBuildOptions<TData>
	): Promise<discord.RoleSelectMenuBuilder> {
		const builder = new discord.RoleSelectMenuBuilder();
		const placeholder = options?.placeholder ?? this.placeholder;
		const min_values = options?.min_values ?? this.min_values;
		const max_values = options?.max_values ?? this.max_values;
		const default_roles = options?.default_roles ?? this.default_roles;

		if (placeholder) builder.setPlaceholder(placeholder);
		if (min_values !== undefined) builder.setMinValues(min_values);
		if (max_values !== undefined) builder.setMaxValues(max_values);
		if (default_roles) builder.setDefaultRoles(...default_roles);

		let idString: string;
		if (this.parent && this.group) {
			idString = `${this.parent}:${this.group}:${this.id}`;
		} else if (this.parent) {
			idString = `${this.parent}:${this.id}`;
		} else {
			idString = this.id;
		}
		const customId = createCustomId(idString, { data: options?.data as Record<string, any> });
		builder.setCustomId(customId);
		return builder;
	}
}
