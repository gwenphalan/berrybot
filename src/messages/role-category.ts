import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, Guild } from 'discord.js';
import { util } from '../bot';
import { MessageBuilder } from '../interfaces';
import EditButtons from '../components/buttons/category-edit';
import EditButton from '../components/buttons/role-category';
import BackButton from '../components/buttons/roles-back';

/**
 * Role category message builder
 * Creates an interactive message for viewing or editing a specific role category
 */
export const RoleCategory: MessageBuilder = {
	/** Initial embed - populated in build method */
	embeds: [new EmbedBuilder()],
	/** Initial empty components array - populated in build method */
	components: [],
	/**
	 * Builds the role category message
	 * @param client - The bot client instance
	 * @param guild - The Discord guild to build the message for
	 * @param action - The action to perform ('view' or 'edit')
	 * @param category - The name of the category to display
	 * @returns Promise resolving to the built message components
	 */
	async build(client, guild: Guild, action: 'view' | 'edit', category: string) {
		// Find the specified category in the database
		const c = (await client.database.guildSettings.get(guild.id))?.selfRoles?.categories.find(
			(c) => c.name === category
		);

		// Initialize array for component rows
		const components = [];

		// Set up the embed with category information
		this.embeds[0]
			.setTitle(`Self Roles - ${category}`)
			.setColor(await util.Color.getGuildColor(guild));

		if (!c) {
			// If category doesn't exist, show error message
			this.embeds[0].setDescription(`This category does not exist.`);
		} else {
			// If category exists, display its details
			this.embeds[0].setFields([
				{
					name: 'Name',
					value: c.name,
					inline: true,
				},
				{
					name: 'Emoji',
					value: c.emoji,
					inline: true,
				},
				{
					name: 'Roles',
					value:
						c.roles?.length > 0
							? c.roles.map((role) => `<@&${role}>`).join(', ')
							: 'None',
				},
			]);
		}

		if (action === 'edit') {
			// If in edit mode, show category editing buttons
			components.push(
				new ActionRowBuilder<ButtonBuilder>().setComponents([
					await EditButtons.build(client, 'name', category),
					await EditButtons.build(client, 'emoji', category),
					await EditButtons.build(client, 'roles', category),
					await EditButtons.build(client, 'delete', category),
				])
			);

			// Add back button
			components.push(
				new ActionRowBuilder<ButtonBuilder>().setComponents([
					await BackButton.build(client),
				])
			);
		} else {
			// If in view mode, show back and edit buttons
			components.push(
				new ActionRowBuilder<ButtonBuilder>().setComponents([
					await BackButton.build(client),
					await EditButton.build(client, 'edit', category),
				])
			);
		}

		return {
			embeds: this.embeds,
			components: components,
		};
	},
};
