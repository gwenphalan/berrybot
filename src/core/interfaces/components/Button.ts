import { BaseMessageComponent } from '../MessageComponent';
import * as discord from 'discord.js';

/**
 * Interface for Button components extending BaseMessageComponent.
 */
export interface ButtonComponent<TData = any> extends BaseMessageComponent<TData> {
	style?: discord.ButtonStyle;
	label?: string;
	url?: string;
	customId?: string;
	emoji?: string | discord.APIEmoji;
	type?: typeof discord.ComponentType.Button;
}
