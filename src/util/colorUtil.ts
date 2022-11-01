import { Guild, HexColorString, RGBTuple } from 'discord.js';
import { createCanvas, loadImage } from 'canvas';

type ColorName =
    | 'Red'
    | 'Orange'
    | 'Yellow'
    | 'Green'
    | 'Blue'
    | 'Purple'
    | 'Pink'
    | 'Brown'
    | 'White'
    | 'Black'
    | 'Grey'
    | 'Aqua'
    | 'Lime'
    | 'Magenta'
    | 'Silver'
    | 'Cyan'
    | 'Gold';

/**
 * Converts a color name to a hex color string, or returns a random color if no color name is provided.
 *
 * Accepted Color Names:
 * `Red`, `Orange`, `Yellow`, `Green`, `Blue`, `Purple`, `Pink`, `Brown`, `White`, `Black`, `Grey`, `Aqua`, `Lime`, `Magenta`, `Silver`, `Cyan`, `Gold`
 * @param {ColorName} color The color name to convert to a hex color string.
 * @returns The hex color string. (eg #02f2f2)
 * @example
 * colorToHex('Red'); // returns #ff0000
 * colorToHex('Blue'); // returns #0000ff
 * colorToHex('Green'); // returns #008000
 * colorToHex(); // returns a random hex color string
 */
export function colorToHex(color?: ColorName): HexColorString {
    if (!color) {
        return <HexColorString>('#' + Math.floor(Math.random() * 16777215).toString(16));
    }
    const colors: Record<ColorName, HexColorString> = {
        Red: '#FF0000',
        Orange: '#FFA500',
        Yellow: '#FFFF00',
        Green: '#008000',
        Blue: '#0000FF',
        Purple: '#800080',
        Pink: '#FFC0CB',
        Brown: '#A52A2A',
        White: '#FFFFFF',
        Black: '#000000',
        Grey: '#808080',
        Aqua: '#00FFFF',
        Lime: '#00FF00',
        Magenta: '#FF00FF',
        Silver: '#C0C0C0',
        Cyan: '#00FFFF',
        Gold: '#FFD700'
    };
    return colors[color];
}

/**
 * Returns the dominant color of an image.
 * @param {string} url The URL of the image to get the dominant color of.
 * @returns The hex color string. (eg #02f2f2)
 * @example
 * getDominantColor('https://i.imgur.com/0X0X0X0.png'); // returns #02f2f2
 */
export async function getDominantColor(url: string): Promise<HexColorString> {
    const image = await loadImage(url);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const pixels = imageData.data;
    const pixelCount = image.width * image.height;
    const rgb = { r: 0, g: 0, b: 0 };
    for (let i = 0, offset, r, g, b, brightness; i < pixelCount; i = i + 1) {
        offset = i * 4;
        r = pixels[offset + 0];
        g = pixels[offset + 1];
        b = pixels[offset + 2];
        brightness = (r + g + b) / 3;
        rgb.r += r * brightness;
        rgb.g += g * brightness;
        rgb.b += b * brightness;
    }
    rgb.r = Math.floor(rgb.r / pixelCount);
    rgb.g = Math.floor(rgb.g / pixelCount);
    rgb.b = Math.floor(rgb.b / pixelCount);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Returns the average color of an image.
 * @param {string} url The URL of the image to get the average color of.
 * @returns The hex color string. (eg #02f2f2)
 * @example
 * getAverageColor('https://i.imgur.com/0X0X0X0.png'); // returns #02f2f2
 */
export async function getAverageColor(url: string): Promise<HexColorString> {
    const image = await loadImage(url);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const pixels = imageData.data;
    const pixelCount = image.width * image.height;
    const rgb = { r: 0, g: 0, b: 0 };
    for (let i = 0, offset, r, g, b; i < pixelCount; i = i + 1) {
        offset = i * 4;
        r = pixels[offset + 0];
        g = pixels[offset + 1];
        b = pixels[offset + 2];
        rgb.r += r;
        rgb.g += g;
        rgb.b += b;
    }
    rgb.r = Math.floor(rgb.r / pixelCount);
    rgb.g = Math.floor(rgb.g / pixelCount);
    rgb.b = Math.floor(rgb.b / pixelCount);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Convert HEX string to RGBtuple
 * @param {string} hex The hex color string to convert to RGBtuple.
 * @returns The RGBtuple. (eg [2, 242, 242])
 * @example
 * hexToRGB('#02f2f2'); // returns [2, 242, 242]
 */
export function hexToRGB(hex: HexColorString): RGBTuple {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return [r, g, b];
}

/**
 * Convert RGBtuple to HEX string
 * @param {number} r The red value of the RGBtuple.
 * @param {number} g The green value of the RGBtuple.
 * @param {number} b The blue value of the RGBtuple.
 * @returns The hex color string. (eg #02f2f2)
 * @example
 * rgbToHex(2, 242, 242); // returns #02f2f2
 */
export function rgbToHex(r: number, g: number, b: number): HexColorString {
    return <HexColorString>('#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''));
}
export async function getGuildColor(guild: Guild): Promise<HexColorString>;
export async function getGuildColor(guild: Guild, rgb: true): Promise<RGBTuple>;

/**
 * Returns the Average Color of the provided guild's icon.
 * @param {Guild} guild The guild to get the average color of.
 * @param {boolean} [rgb=false] Whether to return the RGBtuple or the hex color string.
 * @returns The hex color string. (eg #02f2f2) or the RGBtuple. (eg [2, 242, 242])
 * @example
 * getGuildColor(message.guild); // returns #02f2f2
 * getGuildColor(message.guild, true); // returns [2, 242, 242]
 */
export async function getGuildColor(guild: Guild, rgb?: boolean): Promise<HexColorString | RGBTuple> {
    const iconURL = guild.iconURL({ size: 2048, extension: 'png' });
    const hex = iconURL != null ? await getAverageColor(iconURL) : colorToHex('Aqua');
    return rgb ? hexToRGB(hex) : hex;
}

/**
 * Returns the Dominant Color of the provided guild's icon.
 * @param {Guild} guild The guild to get the dominant color of.
 * @param {boolean} [rgb=false] Whether to return the RGBtuple or the hex color string.
 * @returns The hex color string. (eg #02f2f2) or the RGBtuple. (eg [2, 242, 242])
 * @example
 * getGuildColor(message.guild); // returns #02f2f2
 * getGuildColor(message.guild, true); // returns [2, 242, 242]
 */
export async function getGuildDominantColor(guild: Guild, rgb?: boolean): Promise<HexColorString | RGBTuple> {
    const iconURL = guild.iconURL({ size: 2048, extension: 'png' });
    const hex = iconURL != null ? await getDominantColor(iconURL) : colorToHex('Aqua');
    return rgb ? hexToRGB(hex) : hex;
}
