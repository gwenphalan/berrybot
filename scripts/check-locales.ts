import fs from 'fs';
import path from 'path';

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const REFERENCE_LOCALE = 'en-US.json';

function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
	let keys: string[] = [];
	for (const key in obj) {
		if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
		const value = obj[key];
		const fullKey = prefix ? `${prefix}.${key}` : key;
		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			keys = keys.concat(getAllKeys(value as Record<string, unknown>, fullKey));
		} else {
			keys.push(fullKey);
		}
	}
	return keys;
}

function loadJson(filePath: string) {
	return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function main() {
	const files = fs.readdirSync(LOCALES_DIR).filter((f) => f.endsWith('.json'));
	if (!files.includes(REFERENCE_LOCALE)) {
		console.error(`Reference locale file ${REFERENCE_LOCALE} not found in ${LOCALES_DIR}`);
		process.exit(1);
	}
	const reference = loadJson(path.join(LOCALES_DIR, REFERENCE_LOCALE));
	const referenceKeys = getAllKeys(reference);

	let allOk = true;
	for (const file of files) {
		if (file === REFERENCE_LOCALE) continue;
		const locale = file.replace('.json', '');
		const data = loadJson(path.join(LOCALES_DIR, file));
		const keys = getAllKeys(data);
		const missing = referenceKeys.filter((k) => !keys.includes(k));
		if (missing.length > 0) {
			allOk = false;
			console.log(`\nLocale ${locale} is missing ${missing.length} keys:`);
			missing.forEach((k) => console.log('  -', k));
		} else {
			console.log(`Locale ${locale}: All keys present.`);
		}
	}
	if (allOk) {
		console.log('\nAll locale files are complete!');
	} else {
		console.log('\nSome locale files are missing keys. See above.');
		process.exit(2);
	}
}

if (require.main === module) {
	main();
}
