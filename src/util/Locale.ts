import { Locale } from 'discord.js';

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
            return { region: 'Unknown', emoji: '❔' };
    }
}
