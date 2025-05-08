import { Client } from '../client/BerryClient';
import * as discord from 'discord.js';
import { createCustomId } from '@/core/utils/CustomIdUtils';
import { UserSelectMenuComponent as IUserSelectMenuComponent } from '@/core/interfaces/components/UserSelectMenu';

export interface UserSelectMenuBuildOptions<TData = unknown> {
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	default_users?: string[];
	data: TData;
}

export abstract class UserSelectMenuComponent<TData = unknown>
	implements IUserSelectMenuComponent<TData>
{
	abstract id: string;
	style?: never;
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	default_users?: string[];
	type: typeof discord.ComponentType.UserSelect = discord.ComponentType.UserSelect;
	parent?: string;
	group?: string;

	/**
	 * Build the UserSelectMenuBuilder with the properties of this instance.
	 * @param client - The bot client instance.
	 * @param options - Optional build options.
	 * @param sessionId - Optional session ID for the component.
	 * @param placeholderKey - Optional translation key for the placeholder.
	 * @param locale - Optional locale string for localization.
	 */
	async build(
		client: Client,
		options?: UserSelectMenuBuildOptions<TData>,
		sessionId?: string,
		placeholderKey?: string,
		locale?: string
	): Promise<discord.UserSelectMenuBuilder> {
		let placeholder = options?.placeholder ?? this.placeholder;
		if (placeholderKey && locale) {
			placeholder = client.getTranslation(placeholderKey, locale);
		}
		const min_values = options?.min_values ?? this.min_values;
		const max_values = options?.max_values ?? this.max_values;
		const default_users = options?.default_users ?? this.default_users;

		const builder = new discord.UserSelectMenuBuilder();
		if (placeholder) builder.setPlaceholder(placeholder);
		if (min_values !== undefined) builder.setMinValues(min_values);
		if (max_values !== undefined) builder.setMaxValues(max_values);
		if (default_users) builder.setDefaultUsers(...default_users);

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
