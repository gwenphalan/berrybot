import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, Guild } from 'discord.js';
import { util } from '../bot';
import { MessageBuilder } from '../interfaces';
import RoleCategory from '../components/buttons/role-category';

/**
 * Self-role settings message builder
 * Creates an interactive message for managing self-assignable role categories
 */
export const selfRoleSettings: MessageBuilder = {
	/** Initial empty embeds array - populated in build method */
	embeds: [],
	/** Initial empty components array - populated in build method */
	components: [],
	/**
	 * Builds the self-role settings message
	 * @param client - The bot client instance
	 * @param guild - The Discord guild to build settings for
	 * @returns Promise resolving to the built message components
	 */
	async build(client, guild: Guild) {
		// Fetch existing role categories from database
		const categories = (await client.database.guildSettings.get(guild.id))?.selfRoles
			.categories;

		// Initialize action rows for buttons
		const components: ActionRowBuilder<ButtonBuilder>[] = [
			new ActionRowBuilder<ButtonBuilder>(),
		];
		// Create embed with guild's color
		const embed = new EmbedBuilder().setColor(await util.Color.getGuildColor(guild));

		if (categories.length > 0) {
			// If categories exist, show them and provide management options
			embed.setTitle(`Would you like to view, edit, or create a category?`).setDescription(
				`**Categories:**\n${categories
					.map((c) => {
						return `• ${c.name}`;
					})
					.join('\n')}`
			);
			// Add view and edit buttons to first row
			components[0].addComponents([
				await RoleCategory.build(client, 'view'),
				await RoleCategory.build(client, 'edit'),
			]);
			// Add message management button in second row
			components.push(
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					await RoleCategory.build(client, 'message'),
				])
			);
		} else {
			// If no categories exist, show create prompt
			embed.setTitle(`Click the button below to create a self-role category!`);
		}

		// Always add create button to first row
		components[0].addComponents([await RoleCategory.build(client, 'create')]);

		return {
			embeds: [embed],
			components: components,
		};
	},
};
