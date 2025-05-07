// TODO: Locale Migration
// keys:
//   modal.category_name_input.title.create: 'Create Category'
//   modal.category_name_input.title.edit: 'Edit Category Name'
//   modal.category_name_input.label: 'Category Name'
//   modal.category_name_input.placeholder.create: 'New Category'
//   modal.category_name_input.placeholder.edit: '{{category}}'

import { ModalSubmitInteraction, TextInputStyle } from 'discord.js';
import { ModalComponent, ModalBuildOptions, TextInputOptions } from '@/core/classes/ModalComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import { t } from '@/core/utils/Locale';

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
		options: ModalBuildOptions<{ action: 'create' | 'edit'; category?: string }> = {
			data: { action: 'create' },
		},
		sessionId?: string,
		locale: string = 'en-US'
	) {
		logger.debug('Building category name input modal component');
		const isCreate = options.data.action === 'create';
		const titleKey = isCreate
			? 'modal.category_name_input.title.create'
			: 'modal.category_name_input.title.edit';
		const labelKey = 'modal.category_name_input.label';
		const placeholderKey = isCreate
			? 'modal.category_name_input.placeholder.create'
			: 'modal.category_name_input.placeholder.edit';
		const field: TextInputOptions = {
			custom_id: 'category-name',
			placeholder: t(placeholderKey, {
				locale,
				variables: { category: options.data.category || '' },
			}),
			style: TextInputStyle.Short,
			label: t(labelKey, { locale }),
			required: true,
			min_length: 0,
			max_length: 32,
		};
		return super.build(
			client,
			{
				title: t(titleKey, { locale }),
				fields: [field],
				data: options.data,
			},
			sessionId,
			titleKey,
			locale
		);
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
