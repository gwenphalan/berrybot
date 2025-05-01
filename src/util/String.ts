import { Collection } from 'discord.js';

export function parseStringPlaceholders(str: string, placeholders: Collection<string, string>): string {
    return str.replace(/{{(\w+)}}/g, (match, key) => {
        return placeholders.get(key) || match;
    });
}
