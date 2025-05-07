// TODO: Locale Migration
// keys:
//   button.roles.category_edit.emoji.label: 'Emoji'

import {
	ButtonInteraction,
	EmbedBuilder,
	PermissionFlagsBits,
	MessageReaction,
	User,
} from 'discord.js';
import { ButtonComponent } from '@/core/classes/ButtonComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import { RoleConfigFlow } from '@/flows/roles/RoleConfigFlow';
import { database } from '@/core/config/database';
import { toDiscordLocale, t } from '@/core/utils/Locale';

/**
 * Emoji Select - Triggers emoji select menu
 * Handles emoji button in role category edit menu
 */
export class CategoryEditEmojiButton extends ButtonComponent<{ category: string }> {
	id = 'emoji';
	group = 'category-edit';
	parent = 'roles';
	style = 2; // ButtonStyle.Secondary
	emoji = '🎨';
	static permissions = [PermissionFlagsBits.ManageRoles];

	async build(
		client: Client,
		data?: { category: string },
		sessionId?: string,
		locale: string = 'en-US'
	) {
		return super.build(
			client,
			data,
			sessionId,
			'button.roles.category_edit.emoji.label',
			locale
		);
	}

	async execute(interaction: ButtonInteraction, client: Client, data: { category: string }) {
		const flow = client.flowManager.getHandler<RoleConfigFlow>(interaction.message.id);
		logger.debug({ data }, this.id + ' button clicked with data');
		const userId = interaction.user?.id;
		let locale = 'en-US';
		if (userId) {
			const userSettings = await database.userSettings.get(userId);
			locale = toDiscordLocale(userSettings?.locale || interaction.locale || 'en-US');
		} else {
			locale = toDiscordLocale(interaction.locale || 'en-US');
		}
		if (!interaction.guildId) {
			logger.error('No guild id found for interaction');
			await interaction.reply({
				content: t('roles.category_edit_emoji_button_error_no_guild', { locale }),
				ephemeral: true,
			});
			return;
		}

		if (!flow) {
			logger.error('No flow found for message id', { messageId: interaction.message.id });
			await interaction.reply({
				content: t('roles.category_edit_emoji_button_error_no_flow', { locale }),
				ephemeral: true,
			});
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle(t('roles.category_edit_emoji_button_title', { locale }))
			.setColor('#00BFFF'); // BerryBot Aqua

		const message = await interaction.editReply({ embeds: [embed] });

		// Wait for exactly 1 reaction from the command user
		const reactions = await message.awaitReactions({
			filter: (reaction: MessageReaction, user: User) => {
				// Check if it's from the command user
				if (user.id !== interaction.user.id) return false;

				// If it's a Unicode emoji, it's always accessible
				if (!reaction.emoji.id) return true;

				// For custom emojis, check if the bot is in the guild that owns it
				return interaction.client.guilds.cache.has(reaction.emoji.id);
			},
			max: 1,
			time: 15000,
			errors: ['time'],
		});

		// If no reaction is added, return
		if (reactions.size === 0) {
			return flow.setState({
				id: 'category-edit',
				data: {
					category: data.category,
				},
			});
		}

		// Get the first reaction from the collection the bot has access to
		const emoji = reactions.first();

		// Handle case where no valid reaction was found
		if (!emoji) {
			return flow.setState({
				id: 'category-edit',
				data: {
					category: data.category,
				},
			});
		}

		const guildSettings = await client.database.guildSettings.get(interaction.guildId);

		const category = guildSettings.selfRoles.categories.find(
			(c: any) => c.name === data.category
		);
		if (category) {
			category.emoji = emoji.emoji.id ?? emoji.emoji.name ?? '';
			await guildSettings.save();
		}

		flow.handle(interaction, client, {
			id: 'category-edit',
		});
	}
}

export default CategoryEditEmojiButton;
