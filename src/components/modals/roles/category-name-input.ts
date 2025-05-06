import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ModalComponent, ComponentTypes } from '@/core/interfaces/MessageComponent';
import { logger } from '@/core/logging/Logger';

/**
 *  -
 * Handles
 */
export const MessageComponent: ModalComponent = {
	id: 'roles:category-name-input',
	type: ComponentTypes.Modal,

	async build(
		client: any,
		data: { action: 'create' | 'edit'; category?: string }
	): Promise<ModalBuilder> {
		logger.debug('Building  modal component');

		const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
			new TextInputBuilder()
				.setCustomId('category-name')
				.setPlaceholder(data.action === 'create' ? 'New Category' : data.category || '')
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

	async execute(
		interaction,
		client,
		response,
		data: { action: 'create' | 'edit'; category: string }
	) {
		const _name = response.get('category-name')?.value;
		const flow = client.flowManager.getHandler((await interaction.fetchReply())?.id);
		if (!flow || !interaction.guildId) return;

		const guildSettings = await client.database.guildSettings.get(interaction.guildId);
		if (!guildSettings) return flow.handle(interaction, client, data);
		logger.debug({ response }, ' modal submitted with fields');
	},
};

export default MessageComponent;
