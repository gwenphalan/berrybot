import {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
	SectionBuilder,
	ButtonBuilder,
	StringSelectMenuBuilder,
	ActionRowBuilder,
	Locale as DiscordLocale,
} from 'discord.js';
import type { Client } from '@/core/client/BerryClient';
import { t } from '@/core/utils/Locale';
import { config } from '@/core/config/config';
import { localeManager } from '@/core/managers/LocaleManager';

/**
 * Helper to map locale to country code for flag images
 */
function getCountryCodeForLocale(locale: string): string | null {
	const map: Record<string, string> = {
		'en-US': 'us',
		'en-GB': 'gb',
		fr: 'fr',
		de: 'de',
		'es-ES': 'es',
		'es-419': 'mx', // Use Mexico for LATAM Spanish as a fallback
		it: 'it',
		'pt-BR': 'br',
		ru: 'ru',
		ja: 'jp',
		ko: 'kr',
		'zh-CN': 'cn',
		'zh-TW': 'tw',
		tr: 'tr',
		pl: 'pl',
		uk: 'ua',
		cs: 'cz',
		fi: 'fi',
		'sv-SE': 'se',
		nl: 'nl',
		da: 'dk',
		no: 'no',
		ro: 'ro',
		hu: 'hu',
		bg: 'bg',
		el: 'gr',
		hi: 'in',
		th: 'th',
		vi: 'vn',
		hr: 'hr',
		lt: 'lt',
		id: 'id',
	};
	return map[locale] || null;
}

/**
 * Builds the locale selection message for both the /locale command and select menu updates.
 * @param client - The Discord client instance
 * @param options - { currentLocale, availableLocales }
 */
export async function buildLocaleMessage(
	client: Client,
	options: { currentLocale: DiscordLocale; availableLocales: DiscordLocale[] }
) {
	const { currentLocale, availableLocales } = options;

	// Build the select menu for locale selection
	const selectMenu = new StringSelectMenuBuilder()
		.setCustomId('locale-select')
		.setPlaceholder(
			t('commands.locale.select_placeholder', { locale: currentLocale }) ||
				'Select your language'
		)
		.addOptions(
			availableLocales.map((locale) => {
				const region = locale;
				const emoji = '';
				return {
					label: `${region}`,
					value: locale,
					description:
						localeManager.getTranslation(`locales.${locale}`, locale) || locale,
					default: locale === currentLocale,
				};
			})
		);

	const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

	// Build the support server button
	const supportServerButton = new ButtonBuilder()
		.setLabel(t('commands.locale.support_server', { locale: currentLocale }))
		.setStyle(5)
		.setURL(config.support_server);

	// Build the flag thumbnail for the current locale
	const countryCode = getCountryCodeForLocale(currentLocale);
	const flagUrl = countryCode
		? `https://flagcdn.com/w80/${countryCode}.png`
		: 'https://flagcdn.com/w80/un.png';
	const flagThumbnail = new ThumbnailBuilder().setURL(flagUrl);

	const container = new ContainerBuilder().setAccentColor(
		client.utils.Color.hexToNumber('#00BFFF')
	);

	const title = new TextDisplayBuilder().setContent(
		`# ${t('commands.locale.title', { locale: currentLocale })}`
	);
	const info = new TextDisplayBuilder().setContent(
		t('commands.locale.current', {
			locale: currentLocale,
			variables: { locale: currentLocale },
		})
	);

	const section = new SectionBuilder()
		.addTextDisplayComponents(title, info)
		.setThumbnailAccessory(flagThumbnail);
	container.addSectionComponents(section);
	container.addActionRowComponents(selectRow);

	const supportText = new TextDisplayBuilder().setContent(
		t('commands.locale.support_server', { locale: currentLocale })
	);
	const supportSection = new SectionBuilder()
		.addTextDisplayComponents(supportText)
		.setButtonAccessory(supportServerButton);
	container.addSectionComponents(supportSection);

	return {
		flags: MessageFlags.IsComponentsV2,
		components: [container],
	};
}
