import { BaseMessageComponent } from '../MessageComponent';
import * as discord from 'discord.js';

/**
 * Interface for Channel Select Menu components extending BaseMessageComponent.
 */
export interface ChannelSelectMenuComponent<TData = any> extends BaseMessageComponent<TData> {
	style?: never;
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	channel_types?: discord.ChannelType[];
	type?: typeof discord.ComponentType.ChannelSelect;
}
