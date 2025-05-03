import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	EmbedBuilder,
	PermissionFlagsBits,
	StringSelectMenuBuilder,
} from 'discord.js';
import { util } from '../../bot';
import { ButtonComponent, ComponentTypes } from '../../interfaces/MessageComponent';
import { roleCategorySelect } from '../../messages/role-cateogry-select';
import { RoleCategory } from '../../messages/role-category';
import CategoryName from '../modals/category-name';
import RoleSelect from '../selectMenus/role-select';
import ChannelSelect from '../selectMenus/channel-select';
import BackButton from '../buttons/roles-back';
import { logger } from '../../util';

// Button component for managing role categories and role assignments
export const MessageComponent: ButtonComponent = {
	id: 'role-category',
	type: ComponentTypes.Button,

	async build(
		client,
		action: 'view' | 'edit' | 'create' | 'assign' | 'message',
		category?: string,
		guild?: string
	) {
		logger.debug({ action, category, guild }, 'Building role category button');

		const data = {
			action: action,
			category: category,
		};

		const button = new ButtonBuilder().setCustomId(client.getCustomID('role-category', data));

		// Configure button appearance based on action type
		switch (action) {
			case 'view':
				button.setLabel('View').setStyle(ButtonStyle.Secondary).setEmoji('🔍');
				break;
			case 'edit':
				button.setLabel('Edit').setStyle(ButtonStyle.Secondary).setEmoji('✏️');
				break;
			case 'create':
				button.setLabel('Create').setStyle(ButtonStyle.Success).setEmoji('➕');
				break;
			case 'assign':
				// Check if category exists and has roles
				const database = await client.database.guildSettings.get(guild || '');
				logger.debug({ guild, category }, 'Checking category for assign button');

				if (
					!database ||
					!database.selfRoles ||
					!database.selfRoles.categories?.find((c) => c.name === category)
				) {
					logger.debug({ guild, category }, 'Category not found, disabling button');
					return button
						.setDisabled(true)
						.setLabel('Deleted Category')
						.setStyle(ButtonStyle.Primary)
						.setEmoji('❌');
				}

				const c = database.selfRoles.categories.find((c) => c.name === category);

				if (!c || !c.roles?.length) {
					logger.debug({ guild, category }, 'Category has no roles, disabling button');
					return button
						.setDisabled(true)
						.setLabel('No Roles')
						.setStyle(ButtonStyle.Primary)
						.setEmoji('❌');
				}

				button.setLabel(c.name).setStyle(ButtonStyle.Secondary).setEmoji(c.emoji);
				break;
			case 'message':
				button.setLabel('Send Role Message').setStyle(ButtonStyle.Primary).setEmoji('📨');
				break;
		}

		logger.debug({ action, category, guild }, 'Role category button built successfully');
		return button;
	},

	async execute(
		interaction: ButtonInteraction,
		client,
		data: { action: 'view' | 'edit' | 'create' | 'assign' | 'message'; category?: string }
	) {
		if (!interaction.guild || !interaction.guildId || !interaction.member) {
			logger.warn('Role category button used outside of guild context');
			return;
		}

		logger.debug(
			{
				action: data.action,
				category: data.category,
				guildId: interaction.guildId,
				userId: interaction.user.id,
			},
			'Role category button clicked'
		);

		const member = interaction.guild?.members.cache.get(interaction.member.user.id);

		// Check permissions for non-assign actions
		if (
			data.action !== 'assign' &&
			member &&
			!member.permissions.has(PermissionFlagsBits.ManageRoles)
		) {
			logger.warn(
				{
					userId: interaction.user.id,
					guildId: interaction.guildId,
					action: data.action,
				},
				'User attempted role category action without permissions'
			);

			return interaction.reply({
				content: 'You do not have permission to do this.',
				ephemeral: true,
			});
		}

		// Handle different button actions
		switch (data.action) {
			case 'view':
				logger.debug('Showing category view');
				return interaction.update(
					await roleCategorySelect.build(client, interaction.guild, 'view')
				);
			case 'edit':
				// Show category edit view or category selection
				if (data.category) {
					logger.debug({ category: data.category }, 'Showing category edit view');
					return interaction.update(
						await RoleCategory.build(client, interaction.guild, 'edit', data.category)
					);
				} else {
					logger.debug('Showing category selection for edit');
					return interaction.update(
						await roleCategorySelect.build(client, interaction.guild, 'edit')
					);
				}
			case 'create':
				// Check category limit before creating
				const guildSettings = await client.database.guildSettings.get(interaction.guildId);
				if (
					guildSettings.selfRoles &&
					guildSettings.selfRoles.categories &&
					guildSettings.selfRoles.categories.length > 25
				) {
					logger.warn(
						{
							guildId: interaction.guildId,
							categoryCount: guildSettings.selfRoles.categories.length,
						},
						'Category limit reached'
					);

					interaction.update({
						content: null,
						embeds: [
							new EmbedBuilder()
								.setTitle('Self Roles')
								.setDescription(
									'You have reached the maximum amount of categories!'
								)
								.setColor(await util.Color.getGuildColor(interaction.guild)),
						],
						components: [],
					});
					return;
				}

				logger.debug('Showing category name modal');
				return interaction.showModal(await CategoryName.build(client));
			case 'assign':
				// Show role selection menu for self-assignment
				if (!data.category || !interaction.member) {
					logger.warn('Missing category or member for role assignment');
					return;
				}

				logger.debug(
					{
						category: data.category,
						userId: interaction.user.id,
					},
					'Showing role selection menu'
				);

				return interaction.reply({
					ephemeral: true,
					components: [
						new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([
							await RoleSelect.build(
								client,
								interaction.guild,
								'assign',
								data.category,
								interaction.member
							),
						]),
					],
				});

			case 'message':
				logger.debug('Showing channel selection for role message');
				return interaction.update({
					content: null,
					embeds: [],
					components: [
						new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([
							await ChannelSelect.build(client, interaction.guild, 'message'),
						]),
						new ActionRowBuilder<ButtonBuilder>().addComponents([
							await BackButton.build(client),
						]),
					],
				});
		}
	},
};

export default MessageComponent;
