import { Collection } from 'discord.js';

/**
 * Replaces placeholders in a string with corresponding values from a collection.
 *
 * Placeholders in the string should be in the format `{{key}}`, where `key` corresponds
 * to a key in the provided `placeholders` collection. If a key is not found in the collection,
 * the placeholder will remain unchanged in the output string.
 *
 * @param str - The input string containing placeholders in the format `{{key}}`.
 * @param placeholders - A collection mapping keys to their replacement values.
 * @returns The string with placeholders replaced by their corresponding values from the collection.
 */
export function parseStringPlaceholders(str: string, placeholders: Collection<string, string>): string {
    return str.replace(/{{(\w+)}}/g, (match, key) => {
        return placeholders.get(key) || match;
    });
}
