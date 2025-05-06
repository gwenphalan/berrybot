import { BaseMessageComponent } from '../MessageComponent';
import * as discord from 'discord.js';

/**
 * Interface for User Select Menu components extending BaseMessageComponent.
 */
export interface UserSelectMenuComponent<TData = any> extends BaseMessageComponent<TData> {
	style?: never;
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	default_values?: discord.APISelectMenuDefaultValue<discord.SelectMenuDefaultValueType.User>[];
	type?: typeof discord.ComponentType.UserSelect;
}
