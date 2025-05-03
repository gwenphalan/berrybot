import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	Guild,
	StringSelectMenuBuilder,
} from 'discord.js';
import { util } from '../bot';
import { MessageBuilder } from '../interfaces';
import RoleCategory from '../components/selectMenus/role-category';
import BackButton from '../components/buttons/roles-back';

/**
 * Role category selection message builder
 * Creates an interactive message for viewing or editing role categories
 */
export const roleCategorySelect: MessageBuilder = {
	/** Initial empty embeds array - populated in build method */
	embeds: [],
	/** Initial empty components array - populated in build method */
	components: [],
	/**
	 * Builds the role category selection message
	 * @param client - The bot client instance
	 * @param guild - The Discord guild to build the message for
	 * @param action - The action to perform ('view' or 'edit')
	 * @returns Promise resolving to the built message components
	 */
	async build(client, guild: Guild, action: 'view' | 'edit') {
		// Fetch role categories from database
		const categories = (await client.database.guildSettings.get(guild.id))?.selfRoles
			?.categories;

		// Initialize array for component rows
		const components: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [];

		if (!categories || categories.length === 0) {
			// If no categories exist, show empty state with create button
			this.embeds = [
				new EmbedBuilder()
					.setDescription(`This server has no Self Role categories.`)
					.setTitle(`${guild.name}'s Self Roles`)
					.setColor(await util.Color.getGuildColor(guild)),
			];
			// Add back and create buttons
			components.push(
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					await BackButton.build(client),
					new ButtonBuilder()
						.setCustomId('role-category[{"action":"create"}]')
						.setLabel('Create')
						.setStyle(ButtonStyle.Success)
						.setEmoji('➕'),
				])
			);
		} else {
			// If categories exist, show category selection menu
			components.push(
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					await RoleCategory.build(client, guild, action)
				)
			);
			// Add back button
			components.push(
				new ActionRowBuilder<ButtonBuilder>().addComponents(await BackButton.build(client))
			);
		}

		return {
			embeds: this.embeds,
			components: components,
		};
	},
};
