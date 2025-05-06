import { BaseMessageComponent } from '../MessageComponent';
import * as discord from 'discord.js';

/**
 * Interface for Role Select Menu components extending BaseMessageComponent.
 */
export interface RoleSelectMenuComponent<TData = any> extends BaseMessageComponent<TData> {
	style?: never;
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	default_values?: discord.APISelectMenuDefaultValue<discord.SelectMenuDefaultValueType.Role>[];
	type?: typeof discord.ComponentType.RoleSelect;
}
