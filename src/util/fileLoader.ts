import {glob} from 'glob';
import {promisify} from 'util';

const proGlob = promisify(glob);

export const loadFiles = async (dirName: string) => {
	const Files = await proGlob(`${process.cwd().replace(/\\/g, '/')}/dist/src/${dirName}/**/*.js`);
	Files.forEach(file => {
		delete require.cache[require.resolve(file)];
	});
	return Files;
};
