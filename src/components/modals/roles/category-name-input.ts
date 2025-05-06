import { ModalSubmitInteraction, TextInputStyle } from 'discord.js';
import { ModalComponent, ModalBuildOptions, TextInputOptions } from '@/core/classes/ModalComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';

/**
 * CategoryNameInputModal - Modal for creating or editing a category name
 */
export class CategoryNameInputModal extends ModalComponent<{
	action: 'create' | 'edit';
	category?: string;
}> {
	id = 'category-name-input';
	parent = 'roles';
	title = 'Category Name';
	fields = [];

	async build(
		client: Client,
		options: ModalBuildOptions<{ action: 'create' | 'edit'; category?: string }>
	) {
		logger.debug('Building category name input modal component');
		const field: TextInputOptions = {
			custom_id: 'category-name',
			placeholder:
				options.data.action === 'create' ? 'New Category' : options.data.category || '',
			style: TextInputStyle.Short,
			label: 'Category Name',
			required: true,
			min_length: 0,
			max_length: 32,
		};
		return super.build(client, {
			title: options.data.action === 'create' ? 'Create Category' : 'Edit Category Name',
			fields: [field],
			data: options.data,
		});
	}

	async execute(
		interaction: ModalSubmitInteraction,
		client: Client,
		response: Map<string, { value: string }>,
		data: { action: 'create' | 'edit'; category: string }
	) {
		const _name = response.get('category-name')?.value;
		const flow = client.flowManager.getHandler((await interaction.fetchReply())?.id);
		if (!flow || !interaction.guildId) return;

		const guildSettings = await client.database.guildSettings.get(interaction.guildId);
		if (!guildSettings) return flow.handle(interaction, client, data);
		logger.debug({ response }, ' modal submitted with fields');
	}
}

export default CategoryNameInputModal;
