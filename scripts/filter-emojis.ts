import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { logger } from '../src/core/logging/Logger';

// CLI argument parsing
const argv = yargs(hideBin(process.argv))
	.option('dry-run', {
		type: 'boolean',
		description: 'Do not make any changes, just log actions',
		default: false,
	})
	.option('verbose', {
		type: 'boolean',
		description: 'Enable verbose output',
		default: false,
	})
	.help()
	.parseSync() as { 'dry-run': boolean; verbose: boolean; [key: string]: unknown };

const DRY_RUN = argv['dry-run'];
const VERBOSE = argv['verbose'];

// Define the directory containing emoji files
const emojiDir = path.join(__dirname, '../emojis');
const configFile = path.join(__dirname, '../src/core/config/config.ts');
const emojisJsonFile = path.join(__dirname, '../emojis/emojis.json');

// Enum for deletion reasons
enum DeleteReason {
	DuplicateContent = 'Duplicate image content',
	NameConflict = 'Name conflict',
}

// Track deleted files
const deletedFiles: ReadonlyArray<{ fileName: string; reason: DeleteReason | string }> = [];

// Utility: log if verbose
function vLog(...args: unknown[]) {
	if (VERBOSE) logger.info(args.map(String).join(' '));
}

/**
 * Safely delete a file and track it
 */
async function deleteAndTrack(filePath: string, reason: DeleteReason | string) {
	const fileName = path.basename(filePath);
	try {
		if (!DRY_RUN) await fs.unlink(filePath);
		(
			deletedFiles as unknown as Array<{ fileName: string; reason: DeleteReason | string }>
		).push({ fileName, reason });
		vLog(`Deleted: ${fileName} (${reason})`);
	} catch {
		logger.error(`Error deleting ${fileName}: unknown error`);
	}
}

/**
 * Calculates MD5 hash for a file to detect duplicates
 */
async function calculateFileHash(filePath: string): Promise<string> {
	const fileBuffer = await fs.readFile(filePath);
	const hashSum = crypto.createHash('md5');
	hashSum.update(fileBuffer);
	return hashSum.digest('hex');
}

/**
 * Sanitizes an emoji name to ensure it meets Discord's requirements
 */
function sanitizeEmojiName(name: string): string {
	let sanitized = name.replace(/[^a-zA-Z0-9_]/g, '_');
	if (/^[0-9]/.test(sanitized)) sanitized = 'e_' + sanitized;
	if (sanitized.length < 2) sanitized = sanitized + '_emoji';
	if (sanitized.length > 32) sanitized = sanitized.substring(0, 32);
	return sanitized;
}

async function main() {
	logger.info('Starting emoji file processing...');

	// Track files that have been processed to handle duplicates
	const processedNames = new Set<string>();
	// Track file content hashes to detect duplicate images
	const processedHashes = new Map<string, string>(); // Maps hash -> filename we're keeping

	// Get all PNG files in the emojis directory
	let allFiles: readonly string[] = [];
	try {
		allFiles = (await fs.readdir(emojiDir)).filter((file) => file.endsWith('.png'));
	} catch {
		logger.error('Failed to read emoji directory');
		return;
	}

	logger.info(`Found ${allFiles.length} total PNG files.`);

	// STEP 0: First pass to check for duplicate images and build hash map
	logger.info('Checking for duplicate image content...');
	let duplicateImageCount = 0;

	for (const file of allFiles) {
		const filePath = path.join(emojiDir, file);
		try {
			const fileHash = await calculateFileHash(filePath);
			if (processedHashes.has(fileHash)) {
				const existingFile = processedHashes.get(fileHash)!;
				logger.info(`Found duplicate image content: ${file} is same as ${existingFile}`);
				duplicateImageCount++;
				let keepNew = false;
				const baseName = file.replace('.png', '');
				const existingBaseName = existingFile.replace('.png', '');
				if (/^[0-9]{4}-/.test(existingFile) && !/^[0-9]{4}-/.test(file)) {
					keepNew = true;
				} else if (/_copy|_dupe|_\d+$/.test(baseName)) {
					keepNew = false;
				} else if (/_copy|_dupe|_\d+$/.test(existingBaseName)) {
					keepNew = true;
				} else if (baseName.length < existingBaseName.length) {
					keepNew = true;
				}
				if (keepNew) {
					logger.info(
						`Keeping ${file} and removing ${existingFile} based on naming preference`
					);
					await deleteAndTrack(
						path.join(emojiDir, existingFile),
						`${DeleteReason.DuplicateContent}: ${file}`
					);
					processedHashes.set(fileHash, file);
				} else {
					logger.info(
						`Keeping ${existingFile} and removing ${file} based on naming preference`
					);
					await deleteAndTrack(
						filePath,
						`${DeleteReason.DuplicateContent}: ${existingFile}`
					);
				}
			} else {
				processedHashes.set(fileHash, file);
			}
		} catch {
			logger.error(`Error processing ${file}: unknown error`);
		}
	}

	logger.info(`Removed ${duplicateImageCount} duplicate images based on content.`);

	// STEP 1: Process emoji.gg files (with 4-digit prefixes)
	const prefixedFiles = (await fs.readdir(emojiDir))
		.filter((file) => file.endsWith('.png'))
		.filter((file) => /^[0-9]{4}-/.test(file));

	logger.info(`Found ${prefixedFiles.length} files with emoji.gg format (4-digit prefixes).`);

	for (const file of prefixedFiles) {
		const baseName = file.replace(/^[0-9]{4}-/, '').replace('.png', '');
		const sanitizedFileName = sanitizeEmojiName(baseName.replace(/-/g, '_')) + '.png';
		const oldPath = path.join(emojiDir, file);
		const newPath = path.join(emojiDir, sanitizedFileName);
		if ((await fileExists(newPath)) || processedNames.has(sanitizedFileName)) {
			logger.info(`Removing duplicate: ${file}`);
			await deleteAndTrack(oldPath, `${DeleteReason.NameConflict} with ${sanitizedFileName}`);
		} else {
			logger.info(`Renaming emoji.gg file: ${file} to ${sanitizedFileName}`);
			if (!DRY_RUN) await fs.rename(oldPath, newPath);
			processedNames.add(sanitizedFileName);
		}
	}

	// STEP 2: Process all other emoji files (non-emoji.gg formats)
	const otherFiles = (await fs.readdir(emojiDir))
		.filter((file) => file.endsWith('.png'))
		.filter((file) => !/^[0-9]{4}-/.test(file));

	logger.info(`Found ${otherFiles.length} files with non-emoji.gg formats.`);

	for (const file of otherFiles) {
		const baseName = file.replace('.png', '');
		const sanitizedFileName = sanitizeEmojiName(baseName) + '.png';
		if (file === sanitizedFileName) {
			logger.info(`File already properly named: ${file}`);
			processedNames.add(sanitizedFileName);
			continue;
		}
		const oldPath = path.join(emojiDir, file);
		const newPath = path.join(emojiDir, sanitizedFileName);
		if ((await fileExists(newPath)) || processedNames.has(sanitizedFileName)) {
			logger.info(`Removing duplicate or conflicting file: ${file}`);
			await deleteAndTrack(oldPath, `${DeleteReason.NameConflict} with ${sanitizedFileName}`);
		} else {
			logger.info(`Sanitizing non-emoji.gg file: ${file} to ${sanitizedFileName}`);
			if (!DRY_RUN) await fs.rename(oldPath, newPath);
			processedNames.add(sanitizedFileName);
		}
	}

	logger.info('Emoji file sanitization complete!');

	// STEP 3: Update emojis.json and index.ts files
	logger.info('Updating emoji interface and JSON...');

	const finalEmojiFiles = (await fs.readdir(emojiDir)).filter((file) => file.endsWith('.png'));
	const emojiMap: Record<string, string> = {};
	for (const file of finalEmojiFiles) {
		const sanitizedBaseName = file.replace('.png', '');
		const propertyName = sanitizedBaseName;
		logger.info(`Processing: ${file} -> JSON property: ${propertyName}`);
		emojiMap[propertyName] = '';
	}

	// Update emojis.json
	try {
		let existingData: Record<string, string> = {};
		try {
			if (await fileExists(emojisJsonFile)) {
				existingData = JSON.parse(await fs.readFile(emojisJsonFile, 'utf8'));
			}
		} catch {
			logger.warn('Could not read existing emojis.json, will create new file');
		}
		const finalData: Record<string, string> = {};
		Object.keys(emojiMap).forEach((key) => {
			finalData[key] = existingData[key] || '';
		});
		if (!DRY_RUN) await fs.writeFile(emojisJsonFile, JSON.stringify(finalData, null, 2));
		logger.info('Updated emojis.json');
	} catch (error: unknown) {
		logger.error('Error updating emojis.json:', error);
	}

	// Update the TypeScript interface in index.ts
	try {
		let configContent = await fs.readFile(configFile, 'utf8');
		const interfaceRegex = /interface Emojis \{[\s\S]*?\}/;
		const interfaceMatch = configContent.match(interfaceRegex);
		if (interfaceMatch) {
			const properties = Object.keys(emojiMap)
				.map((prop) => `\t${prop}: string;`)
				.join('\n');
			const newInterface = `interface Emojis {\n${properties}\n}`;
			configContent = configContent.replace(interfaceRegex, newInterface);
			if (!DRY_RUN) await fs.writeFile(configFile, configContent);
			logger.info('Updated TypeScript interface in index.ts');
		} else {
			logger.error('Could not find Emojis interface in index.ts');
		}
	} catch (error: unknown) {
		logger.error('Error updating index.ts:', error);
	}

	// Print the list of deleted files
	if ((deletedFiles as unknown as Array<{ fileName: string; reason: string }>).length > 0) {
		logger.info('=== DELETED FILES ===');
		logger.info('The following files were deleted during processing:');
		const groupedByReason: Record<string, string[]> = {};
		(deletedFiles as unknown as Array<{ fileName: string; reason: string }>).forEach(
			({ fileName, reason }) => {
				if (!groupedByReason[reason]) groupedByReason[reason] = [];
				groupedByReason[reason].push(fileName);
			}
		);
		Object.entries(groupedByReason).forEach(([reason, files]) => {
			logger.info(`\n${reason} (${files.length} files):`);
			files.forEach((file) => logger.info(`  - ${file}`));
		});
		logger.info(
			`\nTotal: ${(deletedFiles as unknown as Array<{ fileName: string; reason: string }>).length} files deleted`
		);
	}

	logger.info('All updates complete!');
	logger.info('Emoji Naming Guide:');
	logger.info('- Processed emoji.gg files (4-digit prefix) and other formats');
	logger.info('- Removed duplicate images with identical content but different names');
	logger.info('- ALL file names use snake_case (underscores): my_emoji.png');
	logger.info('- JSON properties also use snake_case: my_emoji');
	logger.info("- This format is compatible with Discord's naming requirements");
	logger.info('Existing emojis in Discord will retain their IDs in emojis.json');
}

async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

main().catch((err: unknown) => {
	logger.error('Fatal error in emoji processing:', err);
	process.exit(1);
});
