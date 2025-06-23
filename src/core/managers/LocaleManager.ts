import { promises as fs } from 'fs';
import path from 'path';
import AsciiTable from 'ascii-table';
import { logger } from '@/core/logging/Logger';

/**
 * LocaleManager handles loading and retrieving translations for the bot.
 * It supports fallback logic and variable interpolation.
 */
export class LocaleManager {
	private static instance: LocaleManager;
	private locales: Record<string, Record<string, any>> = {};
	private loaded = false;
	private readonly localesDir = path.resolve(__dirname, '../../locales');
	private readonly defaultLocale = 'en-US';

	private constructor() {}

	public static getInstance(): LocaleManager {
		if (!LocaleManager.instance) {
			LocaleManager.instance = new LocaleManager();
		}
		return LocaleManager.instance;
	}

	/**
	 * Loads all locale JSON files from the locales directory.
	 */
	public async loadLocales(): Promise<void> {
		if (this.loaded) return;
		const table = new AsciiTable().setHeading('Locale', 'Status');
		let loadedCount = 0;
		try {
			const files = await fs.readdir(this.localesDir);
			for (const file of files) {
				if (file.endsWith('.json')) {
					const locale = file.replace('.json', '');
					const filePath = path.join(this.localesDir, file);
					try {
						const data = await fs.readFile(filePath, 'utf-8');
						this.locales[locale] = JSON.parse(data);
						table.addRow(locale, '🟩');
						loadedCount++;
					} catch (err) {
						table.addRow(locale, '🟥');
						logger.error(
							{ locale, file: filePath, error: err },
							'[LocaleManager] Failed to load locale'
						);
					}
				}
			}
			this.loaded = true;
			logger.info('\n' + table.toString());
			logger.info(`[LocaleManager] Locales Loaded - Total: ${loadedCount}`);
		} catch (error) {
			logger.error('[LocaleManager.loadLocales]', error);
			throw new Error(`[LocaleManager.loadLocales] Failed to load locales: ${error}`);
		}
	}

	/**
	 * Retrieves a translation for a given key and locale, with fallback.
	 */
	public getTranslation(
		key: string,
		locale: string,
		fallbackLocale?: string
	): string | undefined {
		const tryLocales = [locale, fallbackLocale, this.defaultLocale].filter(Boolean) as string[];
		for (const loc of tryLocales) {
			const value = this.getNestedValue(this.locales[loc], key);
			if (typeof value === 'string') return value;
		}
		return undefined;
	}

	/**
	 * Main translation function. Supports variable interpolation.
	 */
	public t(
		key: string,
		options: { locale: string; fallbackLocale?: string; variables?: Record<string, string> }
	): string {
		const raw = this.getTranslation(key, options.locale, options.fallbackLocale);
		if (!raw) return key; // Return key if translation is missing
		if (!options.variables) return raw;
		return raw.replace(/\{(\w+)\}/g, (_, v) => options.variables?.[v] ?? `{${v}}`);
	}

	/**
	 * Helper to get a nested value from an object using dot notation.
	 */
	private getNestedValue(obj: Record<string, any> | undefined, key: string): any {
		if (!obj) return undefined;
		return key
			.split('.')
			.reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
	}
}

// Export a singleton instance
export const localeManager = LocaleManager.getInstance();
