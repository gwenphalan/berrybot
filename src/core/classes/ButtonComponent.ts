import { Client } from '../client/BerryClient';
import * as discord from 'discord.js';
import { logger } from '@/core/logging/Logger';

export abstract class ButtonComponent<TData = unknown> {
	abstract id: string;
	style?: discord.ButtonStyle;
	label?: string;
	url?: string;
	emoji?: string | discord.APIEmoji;
	disabled?: boolean;
	type: typeof discord.ComponentType.Button = discord.ComponentType.Button;
	parent?: string;
	group?: string;

	/**
	 * Build the ButtonBuilder with the properties of this instance.
	 */
	async build(client: Client, data?: TData, sessionId?: string): Promise<discord.ButtonBuilder> {
		const builder = new discord.ButtonBuilder()
			.setStyle(this.style ?? discord.ButtonStyle.Primary)
			.setLabel(this.label ?? '');

		if (this.disabled !== undefined) builder.setDisabled(this.disabled);
		if (this.emoji) builder.setEmoji(this.emoji as discord.ComponentEmojiResolvable);
		if (this.url) builder.setURL(this.url);

		let idString: string;
		if (this.parent && this.group) {
			idString = `${this.parent}:${this.group}:${this.id}`;
		} else if (this.parent) {
			idString = `${this.parent}:${this.id}`;
		} else {
			idString = this.id;
		}

		logger.debug(
			{ idString, data, sessionId },
			'[ButtonComponent.build] Building button with customId params'
		);
		const customId = client.utils.CustomId.createCustomId(idString, {
			data: data as Record<string, any>,
			sessionId,
		});
		logger.debug({ customId }, '[ButtonComponent.build] Resulting customId');
		builder.setCustomId(customId);
		return builder;
	}
}
