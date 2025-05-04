import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ModalComponent, ComponentTypes } from '@/interfaces/MessageComponent';
import { logger } from '@/util';

/**
 *  -
 * Handles
 */
export const MessageComponent: ModalComponent = {
	id: 'roles:category-delete-confirmation',
	type: ComponentTypes.Modal,

	async build(client, data: { category: string }) {
		logger.debug('Building  modal component');

		const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
			new TextInputBuilder()
				.setCustomId('category-name')
				.setStyle(TextInputStyle.Short)
				.setLabel(`Type ${data.category} to confirm deletion.`)
				.setRequired()
				.setMinLength(0)
				.setMaxLength(data.category.length)
		);

		const modal = new ModalBuilder()
			.setTitle('Delete Confirmation')
			.setCustomId(client.getCustomID(this.id, data))
			.setComponents([row]);

		logger.debug(' modal built successfully');
		return modal;
	},

	async execute(interaction, _client, fields) {
		logger.debug({ fields }, ' modal submitted with fields');
	},
};

export default MessageComponent;
