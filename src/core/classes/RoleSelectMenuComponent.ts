import { Client } from '../client/BerryClient';
import * as discord from 'discord.js';
import { createCustomId } from '@/core/utils/CustomIdUtils';
import { RoleSelectMenuComponent as IRoleSelectMenuComponent } from '@/core/interfaces/components/RoleSelectMenu';

export interface RoleSelectMenuBuildOptions<TData = unknown> {
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	default_roles?: string[];
	data: TData;
}

export abstract class RoleSelectMenuComponent<TData = unknown>
	implements IRoleSelectMenuComponent<TData>
{
	abstract id: string;
	style?: never;
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	default_roles?: string[];
	type: typeof discord.ComponentType.RoleSelect = discord.ComponentType.RoleSelect;
	parent?: string;
	group?: string;

	/**
	 * Build the RoleSelectMenuBuilder with the properties of this instance.
	 * @param client - The bot client instance.
	 * @param options - Optional build options.
	 * @param sessionId - Optional session ID for the component.
	 * @param placeholderKey - Optional translation key for the placeholder.
	 * @param locale - Optional locale string for localization.
	 */
	async build(
		client: Client,
		options?: RoleSelectMenuBuildOptions<TData>,
		sessionId?: string,
		placeholderKey?: string,
		locale?: string
	): Promise<discord.RoleSelectMenuBuilder> {
		let placeholder = options?.placeholder ?? this.placeholder;
		if (placeholderKey && locale) {
			placeholder = client.getTranslation(placeholderKey, locale);
		}
		const min_values = options?.min_values ?? this.min_values;
		const max_values = options?.max_values ?? this.max_values;
		const default_roles = options?.default_roles ?? this.default_roles;

		const builder = new discord.RoleSelectMenuBuilder();
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
		const customId = createCustomId(idString, {
			data: options?.data as Record<string, any>,
			sessionId,
		});
		builder.setCustomId(customId);
		return builder;
	}
}
