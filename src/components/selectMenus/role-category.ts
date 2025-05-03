import { Guild, PermissionFlagsBits, StringSelectMenuBuilder } from 'discord.js';
import { ComponentTypes, SelectMenuComponent } from '../../interfaces/MessageComponent';
import { RoleCategory } from '../../messages/role-category';

// Select menu for choosing role categories to view or edit
export const MessageComponent: SelectMenuComponent = {
	id: 'role-category',
	type: ComponentTypes.SelectMenu,
	permissions: [PermissionFlagsBits.ManageRoles],

	async build(client, guild: Guild, action: 'view' | 'edit') {
		// Fetch available categories from database
		const categories = (await client.database.guildSettings.get(guild.id)).selfRoles
			?.categories;

		const data = {
			action: action,
		};

		// Create select menu with action context
		const builder = new StringSelectMenuBuilder()
			.setCustomId(client.getCustomID('role-category', data))
			.setPlaceholder('Select Category');

		// Handle empty categories state
		if (!categories) builder.setDisabled().setPlaceholder('No categories to select');
		else
			builder.addOptions(
				categories.map((c) => ({ label: c.name, value: c.name, emoji: c.emoji }))
			);

		return builder;
	},

	async execute(interaction, client, selected, data: { action: 'view' | 'edit' }) {
		// Validate selection and guild context
		if (!selected || !interaction.guild)
			return interaction.reply({
				content: 'You must select at least one category.',
				ephemeral: true,
			});

		// Show selected category view
		return interaction.update(
			await RoleCategory.build(client, interaction.guild, data.action, selected.value)
		);
	},
};

export default MessageComponent;
