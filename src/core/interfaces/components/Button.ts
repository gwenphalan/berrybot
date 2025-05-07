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
	/**
	 * Handles the component interaction.
	 * @param interaction - The interaction object from Discord.
	 * @param client - The bot client instance.
	 * @param data - Optional data parsed from the custom ID (typed).
	 * @param guild - Optional guild where the interaction occurred.
	 * @param response - Optional modal response data.
	 * @param selected - Optional selected options for select menus.
	 */
	execute?(
		interaction: discord.ButtonInteraction,
		client: import('@/core/client/BerryClient').Client,
		data?: TData,
		guild?: discord.Guild,
		response?: discord.Collection<string, discord.TextInputComponent>,
		selected?: discord.APISelectMenuOption | discord.APISelectMenuOption[]
	): Promise<void>;
}
