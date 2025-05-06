import { glob } from 'glob';
import { logger } from '@/core/logging/Logger';

/**
 * Asynchronously loads all JavaScript files from a specified directory within the build folder.
 *
 * @param dirName - The name of the directory to search for JavaScript files.
 * @returns A promise that resolves to an array of file paths, with all backslashes replaced by forward slashes.
 *
 * The function constructs a glob pattern based on the current working directory,
 * targeting all `.js` files within the specified directory under the `build` folder.
 */
export async function load(
	dirName: string,
	inDist = true,
	fileType: string = 'js'
): Promise<string[]> {
	logger.debug(`Loading files from directory: ${dirName}`);

	// Construct glob pattern for JavaScript files in the specified directory
	// Replace Windows backslashes with forward slashes for cross-platform compatibility

	// if inDist is true, use the dist folder, otherwise use the root folder
	const pattern = `${process.cwd().replace(/\\/g, '/')}/${inDist ? 'dist/' : ''}${dirName}/**/*.${fileType}`;
	logger.debug(`Using glob pattern: ${pattern}`);

	try {
		// Find all matching files using glob
		const files = await glob(pattern);
		logger.debug(`Found ${files.length} files in ${dirName}`);

		// Normalize all file paths to use forward slashes
		const normalizedFiles = files.map((file) => file.replace(/\\/g, '/'));
		logger.debug(`Normalized ${normalizedFiles.length} file paths`);

		return normalizedFiles;
	} catch (error) {
		logger.error({ error, dirName, pattern }, 'Failed to load files');
		throw error;
	}
}
