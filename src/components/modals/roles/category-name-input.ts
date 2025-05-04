import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ModalComponent, ComponentTypes } from '@/interfaces/MessageComponent';
import { logger } from '@/util';

/**
 *  -
 * Handles
 */
export const MessageComponent: ModalComponent = {
	id: 'roles:category-name-input',
	type: ComponentTypes.Modal,

	async build(client, data: { action: 'create' | 'edit'; category: string }) {
		logger.debug('Building  modal component');

		const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
			new TextInputBuilder()
				.setCustomId('category-name')
				.setPlaceholder(data.action === 'create' ? 'New Category' : data.category)
				.setStyle(TextInputStyle.Short)
				.setLabel('Category Name')
				.setRequired()
				.setMinLength(0)
				.setMaxLength(32)
		);

		const modal = new ModalBuilder()
			.setTitle(data.action === 'create' ? 'Create Category' : 'Edit Category Name')
			.setCustomId(client.getCustomID(this.id, data))
			.setComponents([row]);

		logger.debug('Category name input modal built successfully');
		return modal;
	},

	async execute(interaction, _client, fields) {
		logger.debug({ fields }, ' modal submitted with fields');
	},
};

export default MessageComponent;
