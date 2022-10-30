import { glob } from 'glob';
import { promisify } from 'util';

const proGlob = promisify(glob);

/**
 * Loads all JavaScript files in the specified directory
 * @param {string} directory The directory to load files from
 * @returns {Promise<string[]>} The files loaded
 * @example
 * const files = await loadFiles('./commands');
 * console.log(files);
 * // => [ 'command1.js', 'command2.js', 'command3.js' ]
 * @example
 * const files = await loadFiles('./events');
 * console.log(files);
 * // => [ 'event1.js', 'event2.js', 'event3.js' ]
 */
export default async (dirName: string) => {
    const Files = await proGlob(`${process.cwd().replace(/\\/g, '/')}/dist/src/${dirName}/**/*.js`);
    Files.forEach(file => {
        delete require.cache[require.resolve(file)];
    });
    return Files;
};
