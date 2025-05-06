import { BaseMessageComponent } from '../MessageComponent';
import * as discord from 'discord.js';

/**
 * Interface for Mentionable Select Menu components extending BaseMessageComponent.
 */
export interface MentionableSelectMenuComponent<TData = any> extends BaseMessageComponent<TData> {
	style?: never;
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	type?: typeof discord.ComponentType.MentionableSelect;
}
