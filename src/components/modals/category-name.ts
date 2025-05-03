import {
	ActionRowBuilder,
	ButtonBuilder,
	ModalBuilder,
	PermissionFlagsBits,
	StringSelectMenuBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { ModalComponent, ComponentTypes } from '../../interfaces/MessageComponent';
import { RoleMessage } from '../../messages/role-select';
import RoleSelect from '../selectMenus/role-select';
import BackButton from '../buttons/roles-back';
import { RoleCategory } from '../../messages/role-category';

// Modal component for creating or renaming role categories
export const MessageComponent: ModalComponent = {
	id: 'category-name',
	type: ComponentTypes.Modal,
	permissions: [PermissionFlagsBits.ManageRoles],

	async build(client, category?: string) {
		// Include category name in data if renaming
		const data = category
			? {
					category: category,
				}
			: undefined;

		// Create text input for category name
		const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
			new TextInputBuilder()
				.setCustomId('name')
				.setPlaceholder('Category Name')
				.setStyle(TextInputStyle.Short)
				.setLabel('Category Name')
		);

		const modal = new ModalBuilder()
			.setCustomId(client.getCustomID(this.id, data))
			.setComponents([row]);

		// Set appropriate title based on create/rename context
		category
			? modal.setTitle(`Rename ${category}`)
			: modal.setTitle('What would you like to name this category?');

		return modal;
	},

	async execute(interaction, client, response, data?: { category: string }) {
		const message = interaction.message;
		if (!interaction.guild || !message) return;

		const name = response.get('name')?.value;

		// Validate name input
		if (!name)
			return interaction.reply({
				content: 'You must provide a name for the category.',
				ephemeral: true,
			});
		const database = await client.database.guildSettings.get(interaction.guild.id);

		if (data) {
			// Handle category renaming
			if (!database.selfRoles.categories?.find((c) => c.name === data.category))
				return interaction.reply({
					content: 'This category does not exist.',
					ephemeral: true,
				});

			// Update category name in database
			database.selfRoles.categories = database.selfRoles.categories.map((c) => {
				if (c.name === data.category) c.name = name;
				return c;
			});

			await client.database.guildSettings.update(interaction.guild.id, database);

			// Update role message and return to category view
			await RoleMessage(client, interaction.guild);

			interaction.deferUpdate();
			return message.edit(await RoleCategory.build(client, interaction.guild, 'edit', name));
		}

		// Handle new category creation
		if (database.selfRoles.categories.find((c) => c.name === name))
			return interaction.reply({
				content: 'A category with that name already exists!',
				ephemeral: true,
			});

		// Show role selection for new category
		const rows = [
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([
				await RoleSelect.build(client, interaction.guild, 'create', name),
			]),
			new ActionRowBuilder<ButtonBuilder>().addComponents([await BackButton.build(client)]),
		];

		interaction.deferUpdate();
		return message.edit({ components: rows, embeds: [] });
	},
};

export default MessageComponent;
