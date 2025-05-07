import { Client } from '../client/BerryClient';
import * as discord from 'discord.js';
import { t } from '@/core/utils/Locale';
import { MentionableSelectMenuComponent as IMentionableSelectMenuComponent } from '@/core/interfaces/components/MentionableSelectMenu';

export interface MentionableSelectMenuBuildOptions<TData = unknown> {
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	data: TData;
}

export abstract class MentionableSelectMenuComponent<TData = unknown>
	implements IMentionableSelectMenuComponent<TData>
{
	abstract id: string;
	style?: never;
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	type: typeof discord.ComponentType.MentionableSelect = discord.ComponentType.MentionableSelect;
	parent?: string;
	group?: string;

	/**
	 * Build the MentionableSelectMenuBuilder with the properties of this instance.
	 * @param client - The bot client instance.
	 * @param options - Optional build options.
	 * @param sessionId - Optional session ID for the component.
	 * @param placeholderKey - Optional translation key for the placeholder.
	 * @param locale - Optional locale string for localization.
	 */
	async build(
		client: Client,
		options?: MentionableSelectMenuBuildOptions<TData>,
		sessionId?: string,
		placeholderKey?: string,
		locale?: string
	): Promise<discord.MentionableSelectMenuBuilder> {
		let placeholder = options?.placeholder ?? this.placeholder;
		if (placeholderKey && locale) {
			placeholder = t(placeholderKey, { locale });
		}
		const min_values = options?.min_values ?? this.min_values;
		const max_values = options?.max_values ?? this.max_values;

		const builder = new discord.MentionableSelectMenuBuilder();
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
		const customId = client.utils.CustomId.createCustomId(idString, {
			data: options?.data as Record<string, any>,
			sessionId,
		});
		builder.setCustomId(customId);
		return builder;
	}
}
