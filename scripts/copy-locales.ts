import * as fs from 'fs';
import * as path from 'path';

/**
 * Recursively copy a directory from src to dest.
 * @param src - Source directory
 * @param dest - Destination directory
 */
function copyRecursiveSync(src: string, dest: string): void {
	if (!fs.existsSync(src)) return;
	if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
	for (const entry of fs.readdirSync(src)) {
		const srcPath = path.join(src, entry);
		const destPath = path.join(dest, entry);
		if (fs.lstatSync(srcPath).isDirectory()) {
			copyRecursiveSync(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
			console.log(`[copy-locales] Copied: ${srcPath} -> ${destPath}`);
		}
	}
}

/**
 * Main entry point: copy src/locales to dist/locales
 */
function main() {
	const srcDir = path.resolve(__dirname, '../src/locales');
	const destDir = path.resolve(__dirname, '../dist/locales');
	console.log(`[copy-locales] Copying locales from ${srcDir} to ${destDir}`);
	copyRecursiveSync(srcDir, destDir);
	console.log('[copy-locales] Done.');
}

main();
