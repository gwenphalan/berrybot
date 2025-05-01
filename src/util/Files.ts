import { glob } from 'glob';

/**
 * Asynchronously loads all JavaScript files from a specified directory within the build folder.
 *
 * @param dirName - The name of the directory to search for JavaScript files.
 * @returns A promise that resolves to an array of file paths, with all backslashes replaced by forward slashes.
 *
 * The function constructs a glob pattern based on the current working directory,
 * targeting all `.js` files within the specified directory under the `build` folder.
 */
export async function load(dirName: string): Promise<string[]> {
	const pattern = `${process.cwd().replace(/\\/g, '/')}/build/${dirName}/**/*.js`;
	const files = await glob(pattern);
	return files.map((file) => file.replace(/\\/g, '/'));
}
