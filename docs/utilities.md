# BerryBot Utilities

This document provides an overview of the utility modules available in BerryBot.

## Table of Contents

- [Color Utilities](#color-utilities)
- [File Utilities](#file-utilities)
- [Locale Utilities](#locale-utilities)
- [Logger Utilities](#logger-utilities)
- [String Utilities](#string-utilities)

## Color Utilities

The `Color` module provides functions for color manipulation and conversion.

### Functions

#### `colorToHex(color?: ColorName): HexColorString`

Converts a color name to a hex color string, or returns a random color if no color name is provided.

**Supported Color Names:**

- Red, Orange, Yellow, Green, Blue, Purple, Pink, Brown
- White, Black, Grey, Aqua, Lime, Magenta, Silver, Cyan, Gold

**Example:**

```typescript
colorToHex('Red'); // returns #ff0000
colorToHex(); // returns a random hex color
```

#### `getDominantColor(url: string): Promise<HexColorString>`

Returns the dominant color of an image from a URL.

**Example:**

```typescript
const color = await getDominantColor('https://example.com/image.png');
```

#### `getAverageColor(url: string): Promise<HexColorString>`

Returns the average color of an image from a URL.

**Example:**

```typescript
const color = await getAverageColor('https://example.com/image.png');
```

#### `hexToRGB(hex: HexColorString): RGBTuple`

Converts a hex color string to an RGB tuple.

**Example:**

```typescript
hexToRGB('#02f2f2'); // returns [2, 242, 242]
```

#### `rgbToHex(r: number, g: number, b: number): HexColorString`

Converts RGB values to a hex color string.

**Example:**

```typescript
rgbToHex(2, 242, 242); // returns #02f2f2
```

#### `getGuildColor(guild: Guild, rgb?: boolean): Promise<HexColorString | RGBTuple>`

Returns the average color of a guild's icon.

**Example:**

```typescript
const color = await getGuildColor(message.guild);
const rgbColor = await getGuildColor(message.guild, true);
```

#### `getGuildDominantColor(guild: Guild, rgb?: boolean): Promise<HexColorString | RGBTuple>`

Returns the dominant color of a guild's icon.

**Example:**

```typescript
const color = await getGuildDominantColor(message.guild);
const rgbColor = await getGuildDominantColor(message.guild, true);
```

## File Utilities

The `Files` module provides functions for file system operations.

### Functions

#### `load(dirName: string): Promise<string[]>`

Asynchronously loads all JavaScript files from a specified directory within the build folder.

**Example:**

```typescript
const files = await load('commands');
```

## Locale Utilities

The `Locale` module provides functions for handling Discord locales and regions.

### Functions

#### `getRegionNameAndEmoji(locale: Locale): { region: string; emoji: string }`

Returns the region name and associated emoji for a given Discord locale.

**Example:**

```typescript
const { region, emoji } = getRegionNameAndEmoji('en-US');
// returns { region: 'United States', emoji: '🇺🇸' }
```

**Supported Locales:**

- English (US/GB)
- Spanish (ES)
- French
- German
- Italian
- Japanese
- Korean
- Chinese (CN/TW)
- And many more...

## Logger Utilities

The `Logger` module provides a robust logging system using Pino.

### Features

- Development and production logging levels
- Console and file output
- Pretty printing
- Error logging
- Log rotation
- UTF-8 support for Windows

### Usage

```typescript
import { logger } from './util';

logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

### Color Codes

The logger provides color codes for consistent console output formatting:

**Muted/Dark Colors:**

- charcoal: '#k'
- navyMist: '#n'
- sage: '#s'
- teal: '#t'
- rose: '#r'
- periwinkle: '#p'
- champagne: '#c'
- pearlGray: '#g'
- doveGray: '#d'
- babyBlue: '#b'
- mint: '#m'
- aquaMist: '#a'
- vintageRose: '#v'
- lavender: '#l'
- honey: '#h'
- whiteSmoke: '#w'

**Text Formatting:**

- reset: '#0'
- bold: '#B'
- underline: '#U'
- italic: '#I'
- obfuscated: '#O'

## String Utilities

The `String` module provides functions for string manipulation.

### Functions

#### `parseStringPlaceholders(str: string, placeholders: Collection<string, string>): string`

Replaces placeholders in a string with corresponding values from a collection.

**Example:**

```typescript
const str = 'Hello {{name}}!';
const placeholders = new Collection([['name', 'John']]);
const result = parseStringPlaceholders(str, placeholders);
// returns "Hello John!"
```

## Best Practices

1. **Color Utilities**

    - Use named colors for consistency
    - Handle image loading errors
    - Cache guild colors when possible

2. **File Utilities**

    - Use async/await for file operations
    - Handle file loading errors
    - Use proper file paths

3. **Locale Utilities**

    - Handle unsupported locales gracefully
    - Use proper locale codes
    - Cache region data when possible

4. **Logger Utilities**

    - Use appropriate log levels
    - Include context in log messages
    - Handle log rotation properly

5. **String Utilities**
    - Validate placeholder keys
    - Handle missing placeholders
    - Use proper string encoding

## Common Issues

1. **Color Utilities**

    - Image loading failures
    - Invalid color formats
    - Memory usage with large images

2. **File Utilities**

    - File not found errors
    - Permission issues
    - Path resolution problems

3. **Locale Utilities**

    - Unsupported locales
    - Missing region data
    - Emoji rendering issues

4. **Logger Utilities**

    - Log file permissions
    - Disk space management
    - Log rotation failures

5. **String Utilities**
    - Invalid placeholder syntax
    - Missing placeholder values
    - String encoding issues
