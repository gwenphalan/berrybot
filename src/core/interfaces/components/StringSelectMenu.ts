import { BaseMessageComponent } from '../MessageComponent';
import * as discord from 'discord.js';

/**
 * Interface for String Select Menu components extending BaseMessageComponent.
 */
export interface StringSelectMenuComponent<TData = any> extends BaseMessageComponent<TData> {
	style?: never;
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	options?: discord.APISelectMenuOption[];
	type?: typeof discord.ComponentType.StringSelect;
}
