import { glob } from 'glob';
import { promisify } from 'util';

const proGlob = promisify(glob);

export async function load(dirName: string): Promise<string[]> {
    const Files = await proGlob(`${process.cwd().replace(/\\/g, '/')}/build/${dirName}/**/*.js`);
    Files.forEach(file => {
        delete require.cache[require.resolve(file)];
    });
    return Files;
}
