import { ChatInputCommandInteraction, Locale as DiscordLocale } from 'discord.js';
import { Command } from '@/core/interfaces/Command';
import { localeManager } from '@/core/managers/LocaleManager';
import { database } from '@/core/config/database';
import { logger } from '@/core/logging/Logger';
import { LocalizedSlashCommandBuilder, toDiscordLocale, t } from '@/core/utils/Locale';
import { buildLocaleMessage } from '@/messages/general/locale';

/**
 * /locale command - Allows users to view and change their preferred locale.
 * Uses Discord Components v2 for a modern, interactive UI.
 *
 * - Shows the user's current locale and a list of available locales.
 * - Lets the user select a new locale via a select menu.
 * - Updates the user's locale in the database on selection (handled in a separate interaction handler).
 * - Uses embeds/components for all user-facing text, and localizes all text using localeManager.
 * - Follows BerryBot's UI and code standards.
 *
 * @implements Command
 */
export const LocaleCommand: Command = {
	/**
	 * Command data for Discord registration, using localized name and description.
	 */
	data: new LocalizedSlashCommandBuilder()
		.setName('locale')
		.setDescription('Change your language/locale preference.')
		.setLocalizedName('commands.locale.name')
		.setLocalizedDescription('commands.locale.description'),
	/**
	 * Executes the /locale command.
	 *
	 * @param interaction - The interaction object from Discord
	 * @param client - The bot client instance
	 * @returns Promise<void>
	 */
	async execute(interaction: ChatInputCommandInteraction, client) {
		try {
			// Defer the reply to give the bot time to build the UI and fetch from the DB.
			// Ephemeral means only the user will see the response.
			await interaction.deferReply({ ephemeral: true });

			// Get the Discord user ID of the person running the command.
			const userId = interaction.user.id;

			// Fetch the user's settings from the database, or create them if they don't exist.
			// This is where we get their current locale preference.
			const userSettings = await database.userSettings.get(userId);
			// Use the user's saved locale, or default to 'en-US' if not set, and map to Discord locale
			const currentLocale = toDiscordLocale(userSettings.locale || 'en-US') as DiscordLocale;

			// Get all available locales from the loaded locale files.
			// Only include valid Discord locales and those for which there is a translation file.
			const validDiscordLocales = new Set(Object.values(DiscordLocale));
			const availableLocales = Array.from(
				new Set(
					Object.keys(localeManager['locales'])
						.map(toDiscordLocale)
						.filter((loc) => validDiscordLocales.has(loc as DiscordLocale))
				)
			) as DiscordLocale[];

			// Guard: If only one locale is available, show a message and return
			if (availableLocales.length < 2) {
				await interaction.editReply({
					content:
						t('commands.locale.no_other_languages', { locale: currentLocale }) ||
						'No other languages are available at this time.',
				});
				return;
			}

			// Build the message using the shared template
			const message = await buildLocaleMessage(client, {
				currentLocale,
				availableLocales,
			});

			// Send the message with Components v2.
			await interaction.editReply({
				...message,
				flags: Number(message.flags),
			});
			logger.debug({ userId, currentLocale }, '[LocaleCommand.execute] Locale menu sent');
		} catch (error) {
			logger.error({ error }, '[LocaleCommand.execute] Error handling /locale command');
			// Show a generic error message if something goes wrong
			await interaction.editReply({
				content: 'An error occurred while displaying the locale menu.',
			});
		}
	},
};

export default LocaleCommand;
