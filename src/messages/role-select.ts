import * as discord from 'discord.js';
import { ButtonBuilder } from 'discord.js';
import { util } from '../bot';
import { Client, MessageBuilder } from '../interfaces';
import RoleCategory from '../components/buttons/role-category';
import { logger } from '../util';

/**
 * Role selection message builder
 * Creates an interactive message for users to select self-assignable roles
 */
export const RoleSelect: MessageBuilder = {
	/** Initial embed with placeholder content */
	embeds: [
		new discord.EmbedBuilder()
			.setTitle('Example')
			.setDescription('Choose a category to view and select the roles you want to add.'),
	],
	/** Initial empty components array - populated in build method */
	components: [],
	/**
	 * Builds the role selection message
	 * @param client - The bot client instance
	 * @param guild - The Discord guild to build the message for
	 * @returns Promise resolving to the built message components
	 */
	async build(client, guild: discord.Guild) {
		logger.debug(`Building role selection message for guild: ${guild.id}`);

		// Update embed with guild-specific information
		this.embeds[0]
			.setColor(await util.Color.getGuildColor(guild, true))
			.setTitle(`${guild.name}'s Self Roles`)
			.setDescription(`Choose a category to view and select the roles you want to add.`);

		// Add guild icon if available
		if (guild.iconURL()) {
			logger.debug(`Adding guild icon for guild: ${guild.id}`);
			this.embeds[0].setThumbnail(guild.iconURL({ extension: 'png', size: 256 }));
		}

		// Initialize arrays for button rows
		const rows = [];
		const database = await client.database.guildSettings.get(guild.id);
		logger.debug(
			`Retrieved ${database.selfRoles.categories.length} categories for guild: ${guild.id}`
		);

		// Create first row of buttons
		let row = new discord.ActionRowBuilder<ButtonBuilder>();

		// Add buttons for each role category
		for (const category of database.selfRoles.categories) {
			// Create new row if current row is full (max 5 buttons per row)
			if (row.components.length >= 5) {
				rows.push(row);
				row = new discord.ActionRowBuilder();
			}

			// Build and configure category button
			const button = await RoleCategory.build(client, 'assign', category.name, guild.id);
			if (category.emoji) button.setEmoji(category.emoji);
			row.addComponents(button);
		}

		// Add final row if it contains any buttons
		rows.push(row);
		logger.debug(`Built ${rows.length} button rows for guild: ${guild.id}`);

		return {
			embeds: this.embeds,
			components: rows,
		};
	},
};

/**
 * Creates or updates the role selection message in the specified channel
 * @param client - The bot client instance
 * @param guild - The Discord guild to create/update the message in
 * @param channel - Optional channel ID to send the message to
 * @returns Promise resolving to the created/updated message
 */
export async function RoleMessage(client: Client, guild: discord.Guild, channel?: string) {
	logger.debug(
		`Processing role message for guild: ${guild.id}${channel ? ` in channel: ${channel}` : ''}`
	);

	// Fetch current guild settings
	const database = await client.database.guildSettings.get(guild.id);

	// Try to fetch existing message if channel and message IDs are stored
	let message =
		database.selfRoles.channel && database.selfRoles.message
			? await (
					guild.channels.cache.get(
						database.selfRoles.channel
					) as discord.TextChannel | null
				)?.messages
					.fetch(database.selfRoles.message)
					.catch((error) => {
						logger.error(
							{ error, guildId: guild.id, messageId: database.selfRoles.message },
							'Failed to fetch existing message'
						);
						return null;
					})
			: null;

	// Build new message content
	const content = await RoleSelect.build(client, guild);

	if (channel) {
		// If new channel specified, delete old message and send new one
		if (message) {
			const messageId = message.id; // Store ID before deletion
			logger.debug(`Deleting old message ${messageId} from channel ${message.channel.id}`);
			await message
				.delete()
				.then((m) => {
					logger.debug(`Successfully deleted message ${m.id}`);
				})
				.catch((error) => {
					logger.error({ error, messageId }, 'Failed to delete old message');
				});
		}

		const targetChannel = guild.channels.cache.get(channel) as discord.TextChannel | null;
		if (!targetChannel) {
			logger.error(`Channel ${channel} not found in guild ${guild.id}`);
			return null;
		}

		message = await targetChannel.send(content).catch((error) => {
			logger.error({ error, channelId: channel }, 'Failed to send new message');
			return null;
		});

		// Update database with new message location
		if (message) {
			logger.debug(
				`Updating database with new message location: ${message.channel.id}/${message.id}`
			);
			database.selfRoles.channel = message.channel.id;
			database.selfRoles.message = message.id;
			await database.save();
		}
	} else if (message) {
		// If no new channel but message exists, edit existing message
		const messageId = message.id; // Store ID before potential null
		logger.debug(`Editing existing message ${messageId}`);
		await message
			.edit(content)
			.then((m) => {
				logger.debug(`Successfully edited message ${m.id}`);
			})
			.catch((error) => {
				logger.error({ error, messageId }, 'Failed to edit message');
			});
	} else {
		// If no message exists and no new channel specified, clear message location
		logger.debug(`Clearing message location for guild ${guild.id}`);
		database.selfRoles.channel = undefined;
		database.selfRoles.message = undefined;
		await database.save();
	}

	return message;
}
