import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ModalComponent, ComponentTypes } from '@/core/interfaces/MessageComponent';
import { logger } from '@/core/logging/Logger';

/**
 *  -
 * Handles
 */
export const MessageComponent: ModalComponent = {
	id: 'roles:category-delete-confirmation',
	type: ComponentTypes.Modal,

	async build(client, data: { category: string }): Promise<ModalBuilder> {
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

	async execute(interaction, client, response, data: { category: string }) {
		const confirm = response.get('category-name')?.value;
		const flow = client.flowManager.getHandler((await interaction.fetchReply())?.id);
		if (!flow || !interaction.guildId) return;

		if (confirm !== data.category) {
			return flow.handle(interaction, client, data);
		}

		const guildSettings = await client.database.guildSettings.get(interaction.guildId);
		if (!guildSettings) return flow.handle(interaction, client, data);

		const category = guildSettings.selfRoles.categories.find(
			(categories) => categories.name === data.category
		);
		if (!category) return flow.handle(interaction, client, data);

		guildSettings.selfRoles.categories = guildSettings.selfRoles.categories.filter(
			(categories) => categories.name !== data.category
		);

		await client.database.guildSettings.update(interaction.guildId, guildSettings);

		return flow.handle(interaction, client, data);
	},
};

export default MessageComponent;
