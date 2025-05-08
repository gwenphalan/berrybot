import {
	StringSelectMenuInteraction,
	StringSelectMenuBuilder,
	Locale as DiscordLocale,
} from 'discord.js';
import { StringSelectMenuComponent } from '@/core/classes/StringSelectMenuComponent';
import { localeManager } from '@/core/managers/LocaleManager';
import { getRegionNameAndEmoji, t } from '@/core/utils/Locale';
import { database } from '@/core/config/database';
import { logger } from '@/core/logging/Logger';
import type { Client } from '@/core/client/BerryClient';
import { buildLocaleMessage } from '@/messages/general/locale';

/**
 * LocaleSelectMenu - Select menu component for choosing user locale.
 * Handles locale selection and updates user settings in the database.
 */
export default class LocaleSelectMenu extends StringSelectMenuComponent<{
	currentLocale: DiscordLocale;
	availableLocales: DiscordLocale[];
}> {
	id = 'locale-select';
	min_values = 1;
	max_values = 1;

	/**
	 * Builds the select menu for locale selection.
	 * @param client - The Discord client instance
	 * @param options - Data for building the select menu (currentLocale, availableLocales)
	 * @returns Promise<StringSelectMenuBuilder>
	 */
	async build(
		client: Client,
		options: { data: { currentLocale: DiscordLocale; availableLocales: DiscordLocale[] } },
		sessionId?: string,
		_locale: string = 'en-US'
	): Promise<StringSelectMenuBuilder> {
		const { currentLocale, availableLocales } = options.data;
		logger.debug(
			{ currentLocale, availableLocales },
			'[LocaleSelectMenu.build] Building locale select menu'
		);
		const placeholderKey = 'select.locale.placeholder';
		const placeholder =
			t('commands.locale.select_placeholder', { locale: currentLocale }) ||
			t(placeholderKey, { locale: currentLocale });
		const select = new StringSelectMenuBuilder()
			.setCustomId(this.id)
			.setPlaceholder(placeholder);

		const optionsArray = availableLocales
			.map((locale) => {
				const { region, emoji } = getRegionNameAndEmoji(locale as DiscordLocale);
				return {
					label: region,
					value: locale,
					emoji,
					description:
						localeManager.getTranslation(`locales.${locale}`, locale) || locale,
					default: locale === currentLocale,
				};
			})
			.filter((opt) => !!opt.label && !!opt.value);

		if (optionsArray.length === 0) {
			throw new Error(
				'[LocaleSelectMenu.build] No valid locale options available to display.'
			);
		}
		select.addOptions(optionsArray);
		return select;
	}

	/**
	 * Handles the select menu interaction to update the user's locale.
	 * @param interaction - The select menu interaction
	 * @param client - The Discord client instance
	 * @param _data - (unused)
	 * @param _guild - (unused)
	 * @param _fields - (unused)
	 * @param selected - The selected option (single-select)
	 */
	async execute(
		interaction: StringSelectMenuInteraction,
		client: Client,
		_data?: any,
		_guild?: any,
		_fields?: any,
		selected?: { label: string; value: string }
	): Promise<void> {
		if (!selected) {
			throw new Error('[LocaleSelectMenu.execute] No option selected.');
		}
		const userId = interaction.user.id;
		const newLocale = selected.value as DiscordLocale;
		await database.userSettings.setLocale(userId, newLocale);
		logger.info({ userId, newLocale }, '[LocaleSelectMenu.execute] User locale updated');

		// Fetch available locales for the select menu
		const availableLocales = Object.keys(localeManager['locales'])
			.map((l) => l as DiscordLocale)
			.filter((v, i, arr) => arr.indexOf(v) === i);

		const message = await buildLocaleMessage(client, {
			currentLocale: newLocale,
			availableLocales,
		});

		// Defer the update before editing the ephemeral message
		await interaction.deferUpdate();
		await interaction.editReply({
			...message,
			flags: Number(message.flags),
		});
	}
}
