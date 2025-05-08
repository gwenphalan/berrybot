import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	StringSelectMenuInteraction,
	ModalSubmitInteraction,
	ChatInputCommandInteraction,
	Role,
	ContainerBuilder,
	TextDisplayBuilder,
	MessageFlags,
} from 'discord.js';
import { MessageBuilder } from '@/core/interfaces/MessageBuilder';
import { Client } from '@/core/client/BerryClient';
import { FlowState } from '@/core/interfaces/Flow';
import { logger } from '@/core/logging/Logger';
import ConfigMainMenuCreateButton from '@/components/buttons/roles/config-main-menu/create';
import ConfigMainMenuEditButton from '@/components/buttons/roles/config-main-menu/edit';
import ConfigMainMenuMessageButton from '@/components/buttons/roles/config-main-menu/message';

// Constants for UI and error messages
const ERROR_COLOR = '#FF0000';
const ACCENT_COLOR = '#00BFFF';

interface BuildOptions {
	interaction:
		| ButtonInteraction
		| StringSelectMenuInteraction
		| ModalSubmitInteraction
		| ChatInputCommandInteraction;
}

/**
 * Builds a formatted string representing all self-role categories and their roles for display.
 * Handles fetching roles that may not be cached.
 *
 * @param categories - Array of category objects from guild settings
 * @param interaction - The Discord interaction (for guild/role context)
 * @param locale - The locale for localization
 * @returns Promise<string> - The formatted category content string
 */
function buildCategoryContent(
	categories: any[],
	interaction: BuildOptions['interaction'],
	client: Client,
	locale: string
): Promise<string> {
	return Promise.all(
		categories.map(async (category) => {
			logger.debug({ category }, '[buildCategoryContent] Processing category');
			if (!category.name || typeof category.name !== 'string' || category.name.length < 1) {
				logger.warn({ category }, 'Category with empty or invalid name detected');
				return '';
			}
			const roleIds: string[] = category.roles;
			const roles: string[] = [];
			for (const roleId of roleIds) {
				let role: Role | undefined = interaction.guild?.roles.cache.get(roleId);
				if (!role) {
					try {
						const fetchedRole = await interaction.guild?.roles.fetch(roleId);
						if (fetchedRole) {
							role = fetchedRole;
						}
					} catch (e) {
						logger.warn({ roleId, error: e }, 'Failed to fetch role');
					}
				}
				if (role) {
					roles.push(role.toString());
				}
			}
			const emoji = client.emojis.cache.get(category.emoji);
			return `**${emoji ? emoji.toString() : category.emoji} ${category.name}**\n${roles.length > 0 ? roles.join(', ') : client.getTranslation('roles.main_menu_no_roles', locale)}\n\n`;
		})
	).then((results) => results.join(''));
}

/**
 * Builds the action buttons for the main menu, handling conditional logic for when to show edit/create/message buttons.
 *
 * @param client - The Discord client instance
 * @param categoriesLength - Number of categories (affects which buttons are shown)
 * @param sessionId - Optional sessionId for flow-attached messages
 * @returns Promise<{ buttonRow: ActionRowBuilder<ButtonBuilder>, messageRow: ActionRowBuilder<ButtonBuilder> }>
 */
async function buildButtons(client: Client, categoriesLength: number, sessionId?: string) {
	let createBtn: ButtonBuilder | undefined;
	let editBtn: ButtonBuilder | undefined;
	let messageBtn: ButtonBuilder | undefined;
	const buttonRow = new ActionRowBuilder<ButtonBuilder>();
	const messageRow = new ActionRowBuilder<ButtonBuilder>();
	try {
		createBtn = await new ConfigMainMenuCreateButton().build(client, undefined, sessionId);
		editBtn = await new ConfigMainMenuEditButton().build(client, undefined, sessionId);
		messageBtn = await new ConfigMainMenuMessageButton().build(client, undefined, sessionId);
		logger.debug(
			{
				createBtn: createBtn instanceof ButtonBuilder,
				editBtn: editBtn instanceof ButtonBuilder,
				messageBtn: messageBtn instanceof ButtonBuilder,
			},
			'[buildButtons] Button instances type checks'
		);
		// Only show edit if there are categories; always show create
		if (categoriesLength > 0) {
			if (editBtn) buttonRow.addComponents(editBtn);
			if (createBtn) buttonRow.addComponents(createBtn);
		} else {
			if (createBtn) buttonRow.addComponents(createBtn);
		}
		if (messageBtn) messageRow.addComponents(messageBtn);
	} catch (error) {
		logger.error({ error }, 'Error creating buttons');
	}
	return { buttonRow, messageRow };
}

/**
 * Main Menu - Main menu for self roles configuration
 * Builds a message with main menu functionality for the roles system.
 *
 * - Shows categories and their roles if present, or a prompt to create a category.
 * - Handles error states (e.g., missing guild settings).
 * - Uses Discord UI components for a modern, interactive experience.
 *
 * @implements MessageBuilder
 */
export const MainMenu: MessageBuilder = {
	embeds: [],
	components: [],

	/**
	 * Builds or updates the message content for the main menu.
	 *
	 * @param client - The Discord client instance
	 * @param state - The current flow state (if used in a flow)
	 * @param options - Additional options for building the message (must include interaction)
	 * @param sessionId - Optional sessionId for flow-attached messages
	 * @param locale - The locale for localization
	 * @returns The message payload for Discord
	 */
	async build(
		client: Client,
		state?: FlowState,
		options?: BuildOptions,
		sessionId?: string,
		locale: string = 'en-US'
	) {
		logger.debug({ state, options }, '[MainMenu.build] Building roles main menu message');
		const interaction = state?.interaction || options?.interaction;
		if (!interaction || !interaction.guildId) {
			throw new Error('No interaction found');
		}
		let guildSettings: any;
		try {
			guildSettings = await client.database.guildSettings.get(interaction.guildId);
		} catch (err) {
			logger.error({ err }, 'Failed to fetch guild settings');
			guildSettings = undefined;
		}
		if (!guildSettings) {
			const errorEmbed = new EmbedBuilder()
				.setTitle(client.getTranslation('roles.main_menu_error_title', locale))
				.setDescription(client.getTranslation('roles.main_menu_no_guild_settings', locale))
				.setColor(ERROR_COLOR);
			return {
				embeds: [errorEmbed],
				components: [],
			};
		}
		const categories = guildSettings.selfRoles.categories;
		logger.debug({ categories }, '[MainMenu.build] Categories array from guild settings');
		const titleComponent = new TextDisplayBuilder();
		titleComponent.setContent(
			categories.length > 0
				? client.getTranslation('roles.main_menu_edit_or_create', locale)
				: client.getTranslation('roles.main_menu_create_to_start', locale)
		);
		let categoryContent = '';
		try {
			categoryContent = await buildCategoryContent(categories, interaction, client, locale);
		} catch (err) {
			logger.error({ err }, 'Failed to build category content');
		}
		const effectiveSessionId = sessionId || state?.sessionId;
		const { buttonRow, messageRow } = await buildButtons(
			client,
			categories.length,
			effectiveSessionId
		);
		const container = new ContainerBuilder().setAccentColor(
			client.utils.Color.hexToNumber(ACCENT_COLOR)
		);
		container.addTextDisplayComponents(titleComponent);
		if (categories.length === 0) {
			if (buttonRow.components.length > 0) {
				container.addActionRowComponents(buttonRow);
			}
		} else {
			if (categoryContent) {
				const categoryComponent = new TextDisplayBuilder().setContent(categoryContent);
				container.addTextDisplayComponents(categoryComponent);
			}
			if (buttonRow.components.length > 0) {
				container.addActionRowComponents(buttonRow);
			}
			if (messageRow.components.length > 0) {
				container.addActionRowComponents(messageRow);
			}
		}
		return {
			flags: MessageFlags.IsComponentsV2,
			components: [container],
		};
	},
};

export default MainMenu;
