import { Locale } from 'discord.js';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { localeManager } from '@/core/managers/LocaleManager';
import { parseStringPlaceholders } from '@/core/utils/String';
import { Collection } from 'discord.js';

/**
 * Returns the region name and associated emoji for the given Locale.
 * @param locale The locale to get the region name and emoji for.
 * @returns The region name and emoji.
 * @example
 * getRegionNameAndEmoji('en-US'); // returns { name: 'United States', emoji: '🇺🇸' }
 * getRegionNameAndEmoji('en-GB'); // returns { name: 'United Kingdom', emoji: '🇬🇧' }
 */
export function getRegionNameAndEmoji(locale: Locale): {
	region: string;
	emoji: string;
} {
	// Map Discord locales to their corresponding regions and flag emojis
	switch (locale) {
		case Locale.Bulgarian:
			return { region: 'Bulgaria', emoji: '🇧🇬' };
		case Locale.ChineseCN:
			return { region: 'China', emoji: '🇨🇳' };
		case Locale.ChineseTW:
			return { region: 'Taiwan', emoji: '🇹🇼' };
		case Locale.Croatian:
			return { region: 'Croatia', emoji: '🇭🇷' };
		case Locale.Czech:
			return { region: 'Czechia', emoji: '🇨🇿' };
		case Locale.Danish:
			return { region: 'Denmark', emoji: '🇩🇰' };
		case Locale.Dutch:
			return { region: 'Netherlands', emoji: '🇳🇱' };
		case Locale.Finnish:
			return { region: 'Finland', emoji: '🇫🇮' };
		case Locale.French:
			return { region: 'France', emoji: '🇫🇷' };
		case Locale.German:
			return { region: 'Germany', emoji: '🇩🇪' };
		case Locale.Greek:
			return { region: 'Greece', emoji: '🇬🇷' };
		case Locale.Hindi:
			return { region: 'India', emoji: '🇮🇳' };
		case Locale.Hungarian:
			return { region: 'Hungary', emoji: '🇭🇺' };
		case Locale.Italian:
			return { region: 'Italy', emoji: '🇮🇹' };
		case Locale.Japanese:
			return { region: 'Japan', emoji: '🇯🇵' };
		case Locale.Korean:
			return { region: 'Korea', emoji: '🇰🇷' };
		case Locale.Lithuanian:
			return { region: 'Lithuania', emoji: '🇱🇹' };
		case Locale.Norwegian:
			return { region: 'Norway', emoji: '🇳🇴' };
		case Locale.Polish:
			return { region: 'Poland', emoji: '🇵🇱' };
		case Locale.PortugueseBR:
			return { region: 'Brazil', emoji: '🇧🇷' };
		case Locale.Romanian:
			return { region: 'Romania', emoji: '🇷🇴' };
		case Locale.Russian:
			return { region: 'Russia', emoji: '🇷🇺' };
		case Locale.SpanishES:
			return { region: 'Spain', emoji: '🇪🇸' };
		case Locale.Swedish:
			return { region: 'Sweden', emoji: '🇸🇪' };
		case Locale.Thai:
			return { region: 'Thailand', emoji: '🇹🇭' };
		case Locale.Turkish:
			return { region: 'Turkey', emoji: '🇹🇷' };
		case Locale.Ukrainian:
			return { region: 'Ukraine', emoji: '🇺🇦' };
		case Locale.Vietnamese:
			return { region: 'Vietnam', emoji: '🇻🇳' };
		case Locale.EnglishUS:
			return { region: 'United States', emoji: '🇺🇸' };
		case Locale.EnglishGB:
			return { region: 'United Kingdom', emoji: '🇬🇧' };
		default:
			// Return unknown for unsupported locales
			return { region: 'Unknown', emoji: '❔' };
	}
}

/**
 * Extends SlashCommandBuilder to support localization from locale files.
 */
export class LocalizedSlashCommandBuilder extends SlashCommandBuilder {
	/**
	 * Set the name and its localizations from the locale files.
	 * @param key The key in the locale file (e.g., 'commands.ping.name')
	 * @param defaultLocale The default locale to use (default: 'en')
	 */
	setLocalizedName(key: string, defaultLocale = 'en'): this {
		const localizations: Partial<Record<Locale, string>> = {};
		const supportedDiscordLocales = Object.values(Locale) as Locale[];
		for (const locale of Object.keys(localeManager['locales'])) {
			const discordLocale = toDiscordLocale(locale);
			if (!supportedDiscordLocales.includes(discordLocale as Locale)) continue;
			if (!(discordLocale in Locale)) continue;
			const value = localeManager.getTranslation(key, locale);
			if (value) localizations[discordLocale as Locale] = value;
		}
		const defaultName = localeManager.getTranslation(key, defaultLocale) || key;
		this.setName(defaultName);
		this.setNameLocalizations(localizations);
		return this;
	}

	/**
	 * Set the description and its localizations from the locale files.
	 * @param key The key in the locale file (e.g., 'commands.ping.description')
	 * @param defaultLocale The default locale to use (default: 'en')
	 */
	setLocalizedDescription(key: string, defaultLocale = 'en'): this {
		const localizations: Partial<Record<Locale, string>> = {};
		const supportedDiscordLocales = Object.values(Locale) as Locale[];
		for (const locale of Object.keys(localeManager['locales'])) {
			const discordLocale = toDiscordLocale(locale);
			if (!supportedDiscordLocales.includes(discordLocale as Locale)) continue;
			if (!(discordLocale in Locale)) continue;
			const value = localeManager.getTranslation(key, locale);
			if (value) localizations[discordLocale as Locale] = value;
		}
		const defaultDesc = localeManager.getTranslation(key, defaultLocale) || key;
		this.setDescription(defaultDesc);
		this.setDescriptionLocalizations(localizations);
		return this;
	}
}

/**
 * Extends SlashCommandSubcommandBuilder to support localization from locale files.
 */
export class LocalizedSlashCommandSubcommandBuilder extends SlashCommandSubcommandBuilder {
	/**
	 * Set the name and its localizations from the locale files.
	 * @param key The key in the locale file (e.g., 'commands.ping.subcommand.name')
	 * @param defaultLocale The default locale to use (default: 'en')
	 */
	setLocalizedName(key: string, defaultLocale = 'en'): this {
		const localizations: Partial<Record<Locale, string>> = {};
		const supportedDiscordLocales = Object.values(Locale) as Locale[];
		for (const locale of Object.keys(localeManager['locales'])) {
			const discordLocale = toDiscordLocale(locale);
			if (!supportedDiscordLocales.includes(discordLocale as Locale)) continue;
			if (!(discordLocale in Locale)) continue;
			const value = localeManager.getTranslation(key, locale);
			if (value) localizations[discordLocale as Locale] = value;
		}
		const defaultName = localeManager.getTranslation(key, defaultLocale) || key;
		this.setName(defaultName);
		this.setNameLocalizations(localizations);
		return this;
	}

	/**
	 * Set the description and its localizations from the locale files.
	 * @param key The key in the locale file (e.g., 'commands.ping.subcommand.description')
	 * @param defaultLocale The default locale to use (default: 'en')
	 */
	setLocalizedDescription(key: string, defaultLocale = 'en'): this {
		const localizations: Partial<Record<Locale, string>> = {};
		const supportedDiscordLocales = Object.values(Locale) as Locale[];
		for (const locale of Object.keys(localeManager['locales'])) {
			const discordLocale = toDiscordLocale(locale);
			if (!supportedDiscordLocales.includes(discordLocale as Locale)) continue;
			if (!(discordLocale in Locale)) continue;
			const value = localeManager.getTranslation(key, locale);
			if (value) localizations[discordLocale as Locale] = value;
		}
		const defaultDesc = localeManager.getTranslation(key, defaultLocale) || key;
		this.setDescription(defaultDesc);
		this.setDescriptionLocalizations(localizations);
		return this;
	}
}

/**
 * Maps user-friendly locale codes to Discord-supported locale codes.
 */
export const localeMap: Record<string, string> = {
	en: 'en-US',
	es: 'es-ES',
	sv: 'sv-SE',
	'es-latam': 'es-419',
	pt: 'pt-BR',
	zh: 'zh-CN',
	'zh-hans': 'zh-CN',
	'zh-hant': 'zh-TW',
	no: 'no',
	id: 'id',
	// Add more as needed
};

/**
 * Converts a user locale code to a Discord-supported locale code.
 * @param userLocale - The user locale code (e.g., 'en', 'es')
 * @returns The Discord-supported locale code (e.g., 'en-US', 'es-ES')
 */
export function toDiscordLocale(userLocale: string): string {
	return localeMap[userLocale] || userLocale;
}

/**
 * Main translation function. Supports variable interpolation using {{placeholder}} syntax.
 */
export function t(
	key: string,
	options: { locale: string; fallbackLocale?: string; variables?: Record<string, string> }
): string {
	const raw = localeManager.getTranslation(key, options.locale, options.fallbackLocale);
	if (!raw) return key; // Return key if translation is missing
	if (!options.variables) return raw;
	// Use parseStringPlaceholders to replace {{placeholders}} if variables are provided
	const placeholders = new Collection<string, string>(Object.entries(options.variables));
	return parseStringPlaceholders(raw, placeholders);
}
