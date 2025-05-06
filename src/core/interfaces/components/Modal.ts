import { BaseMessageComponent } from '../MessageComponent';
import * as discord from 'discord.js';

/**
 * Interface for Modal components extending BaseMessageComponent.
 */
export interface ModalComponent<TData = any> extends BaseMessageComponent<TData> {
	title: string;
	fields: discord.APITextInputComponent[];
}
