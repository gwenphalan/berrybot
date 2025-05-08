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
	SeparatorBuilder,
} from 'discord.js';
import type { Client } from '@/core/client/BerryClient';
import { getRegionNameAndEmoji } from '@/core/utils/Locale';
import { config } from '@/core/config/config';
import { localeManager } from '@/core/managers/LocaleManager';

// Add localeToCountryCode map at the top
const localeToCountryCode: Record<string, string> = {
	'en-US': 'US',
	'en-GB': 'GB',
	fr: 'FR',
	de: 'DE',
	'es-ES': 'ES',
	'es-419': 'MX', // Spanish (LATAM) → Mexico as best fit
	it: 'IT',
	'pt-BR': 'BR',
	ru: 'RU',
	ja: 'JP',
	ko: 'KR',
	'zh-CN': 'CN',
	'zh-TW': 'TW',
	tr: 'TR',
	pl: 'PL',
	uk: 'UA',
	cs: 'CZ',
	fi: 'FI',
	'sv-SE': 'SE',
	nl: 'NL',
	da: 'DK',
	no: 'NO',
	ro: 'RO',
	hu: 'HU',
	bg: 'BG',
	el: 'GR',
	hi: 'IN',
	th: 'TH',
	vi: 'VN',
	hr: 'HR',
	lt: 'LT',
	id: 'ID',
};

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
			client.getTranslation('commands.locale.select_placeholder', currentLocale) ||
				'Select your language'
		)
		.addOptions(
			availableLocales.map((locale) => {
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
		);

	const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

	// Build the support server button
	const supportServerButton = new ButtonBuilder()
		.setLabel(client.getTranslation('commands.locale.support_server', currentLocale))
		.setStyle(5)
		.setURL(config.support_server);

	// Build the flag thumbnail for the current locale
	const countryCode = localeToCountryCode[currentLocale] || null;
	const flagUrl = countryCode
		? `https://cdn.unimatrix-01.dev/images/berrybot/flag/${countryCode}.png`
		: 'https://cdn.unimatrix-01.dev/images/berrybot/flag/US.png';
	const flagThumbnail = new ThumbnailBuilder().setURL(flagUrl);

	const container = new ContainerBuilder().setAccentColor(
		client.utils.Color.hexToNumber('#00BFFF')
	);

	const title = new TextDisplayBuilder().setContent(
		`# ${client.getTranslation('commands.locale.title', currentLocale)}`
	);
	const info = new TextDisplayBuilder().setContent(
		client.getTranslation('commands.locale.current', currentLocale, { locale: currentLocale })
	);

	const section = new SectionBuilder()
		.addTextDisplayComponents(title, info)
		.setThumbnailAccessory(flagThumbnail);
	container.addSectionComponents(section);
	container.addActionRowComponents(selectRow);

	// Add a separator before the support server section
	const separator = new SeparatorBuilder().setDivider(true);
	container.addSeparatorComponents(separator);

	const supportText = new TextDisplayBuilder().setContent(
		client.getTranslation('commands.locale.support_server', currentLocale)
	);
	const supportSection = new SectionBuilder()
		.addTextDisplayComponents(supportText)
		.setButtonAccessory(supportServerButton);
	container.addSectionComponents(supportSection);

	const result: any = {
		flags: MessageFlags.IsComponentsV2,
		components: [container],
	};
	return result;
}
