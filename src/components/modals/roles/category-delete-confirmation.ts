import { ModalSubmitInteraction, TextInputStyle } from 'discord.js';
import { ModalComponent, ModalBuildOptions, TextInputOptions } from '@/core/classes/ModalComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';

/**
 * CategoryDeleteConfirmationModal - Modal for confirming deletion of a role category
 */
export class CategoryDeleteConfirmationModal extends ModalComponent<{ category: string }> {
	id = 'category-delete-confirmation';
	parent = 'roles';
	title = 'Delete Confirmation';
	fields = [];

	constructor() {
		super('Delete Confirmation', []);
	}

	async build(client: Client, options: ModalBuildOptions<{ category: string }>) {
		logger.debug('Building category delete confirmation modal component');
		const field: TextInputOptions = {
			custom_id: 'category-name',
			style: TextInputStyle.Short,
			label: `Type ${options.data.category} to confirm deletion.`,
			required: true,
			min_length: 0,
			max_length: options.data.category.length,
		};
		return super.build(client, {
			title: this.title,
			fields: [field],
			data: options.data,
		});
	}

	async execute(
		interaction: ModalSubmitInteraction,
		client: Client,
		response: Map<string, { value: string }>,
		data: { category: string }
	) {
		const confirm = response.get('category-name')?.value;
		const flow = client.flowManager.getHandler((await interaction.fetchReply())?.id);
		if (!flow || !interaction.guildId) return;

		if (confirm !== data.category) {
			return flow.handle(interaction, client, data);
		}

		const guildSettings = await client.database.guildSettings.get(interaction.guildId);
		if (!guildSettings) return flow.handle(interaction, client, data);

		const category = guildSettings.selfRoles.categories.find(
			(categories: any) => categories.name === data.category
		);
		if (!category) return flow.handle(interaction, client, data);

		guildSettings.selfRoles.categories = guildSettings.selfRoles.categories.filter(
			(categories: any) => categories.name !== data.category
		);

		await client.database.guildSettings.update(interaction.guildId, guildSettings);

		return flow.handle(interaction, client, data);
	}
}

export default CategoryDeleteConfirmationModal;
