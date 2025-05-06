import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	StringSelectMenuInteraction,
	ModalSubmitInteraction,
	ChatInputCommandInteraction,
	Role,
} from 'discord.js';
import { MessageBuilder } from '@/core/interfaces/MessageBuilder';
import { Client } from '@/core/client/BerryClient';
import { FlowState } from '@/core/interfaces/Flow';
import { logger } from '@/core/logging/Logger';
// Import main menu components
import {
	Roles_ConfigMainMenu_Create,
	Roles_ConfigMainMenu_Edit,
	Roles_ConfigMainMenu_Message,
} from '@/components';

/**
 * Main Menu - Main menu for self roles configuration
 * Builds a message with main menu functionality
 */
export const MainMenu: MessageBuilder = {
	// Default embeds for the message
	embeds: [],

	// Default components for the message
	components: [],

	/**
	 * Builds or updates the message content
	 * @param client - The Discord client instance
	 * @param state - The current flow state (if used in a flow)
	 * @param options - Additional options for building the message
	 */
	async build(
		client: Client,
		state?: FlowState,
		options?: {
			interaction:
				| ButtonInteraction
				| StringSelectMenuInteraction
				| ModalSubmitInteraction
				| ChatInputCommandInteraction;
		}
	) {
		logger.debug({ state, options }, 'Building messageName message');

		// Get data from state or options
		const interaction = state?.interaction || options?.interaction;

		if (!interaction || !interaction.guildId) {
			throw new Error('No interaction found');
		}

		const guildSettings = await client.database.guildSettings.get(interaction.guildId);

		if (!guildSettings) {
			const errorEmbed = new EmbedBuilder()
				.setTitle('Error')
				.setDescription('No guild settings found')
				.setColor('#FF0000');
			return {
				embeds: [errorEmbed],
				components: [],
			};
		}

		// Update embed with current data
		const embed = new EmbedBuilder()
			.setTitle('Would you like to edit or create a category?')
			.setColor('#00BFFF');

		const categories = guildSettings.selfRoles.categories;

		// Add categories to embed, each category is a field with a list of the roles in the category
		categories.forEach((category) => {
			const roleIds = category.roles;
			const roles: string[] = [];
			roleIds.forEach(async (roleId) => {
				let role: Role | undefined = interaction.guild?.roles.cache.get(roleId);
				if (!role) {
					const fetchedRole = await interaction.guild?.roles.fetch(roleId); // fetch from guild
					if (fetchedRole) {
						role = fetchedRole;
					}
				}
				if (role) {
					roles.push(role.toString());
				}
			});

			embed.addFields({
				name: category.name,
				value: roles.join('\n'),
			});
		});
		const createBtn = await Roles_ConfigMainMenu_Create.build(client);
		const editBtn = await Roles_ConfigMainMenu_Edit.build(client);
		const messageBtn = await Roles_ConfigMainMenu_Message.build(client);

		// Create action row with components
		const rows = [
			new ActionRowBuilder<ButtonBuilder>().addComponents(editBtn, createBtn),
			new ActionRowBuilder<ButtonBuilder>().addComponents(messageBtn),
		];
		logger.debug({ rows }, 'Created action row');

		// Return updated message
		return {
			embeds: [embed],
			components: rows,
		};
	},
};

export default MainMenu;
