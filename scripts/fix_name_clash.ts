import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';

/**
 * Recursively search for files/folders with name clash markers and prompt user to resolve duplicates.
 */
async function fixNameClash(dir: string) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const match = entry.name.match(/^(.*) \(# Name clash [\d-]+ [a-z0-9]+ #\)$/i);
		if (match) {
			const originalName = match[1];
			const clashPath = path.join(dir, entry.name);
			const targetPath = path.join(dir, originalName);

			if (fs.existsSync(targetPath)) {
				const clashStats = fs.statSync(clashPath);
				const targetStats = fs.statSync(targetPath);
				const formatTime = (d: Date) => d.toLocaleString();
				const clashInfo = `Created: ${formatTime(clashStats.birthtime)}, Modified: ${formatTime(clashStats.mtime)}`;
				const targetInfo = `Created: ${formatTime(targetStats.birthtime)}, Modified: ${formatTime(targetStats.mtime)}`;

				const { keep } = await inquirer.prompt([
					{
						type: 'list',
						name: 'keep',
						message:
							`Duplicate found:\n` +
							`1. ${clashPath}\n   ${clashInfo}\n` +
							`2. ${targetPath}\n   ${targetInfo}\nWhich do you want to keep?`,
						choices: [
							{ name: `Keep: ${clashPath}`, value: 'clash' },
							{ name: `Keep: ${targetPath}`, value: 'target' },
						],
					},
				]);
				if (keep === 'clash') {
					fs.rmSync(targetPath, { recursive: true, force: true });
					fs.renameSync(clashPath, targetPath);
					console.log(`[KEPT] ${clashPath} (renamed to ${targetPath})`);
				} else {
					fs.rmSync(clashPath, { recursive: true, force: true });
					console.log(`[KEPT] ${targetPath} (removed ${clashPath})`);
				}
				if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
					await fixNameClash(targetPath);
				}
			} else {
				fs.renameSync(clashPath, targetPath);
				console.log(`[RENAMED] ${clashPath} -> ${targetPath}`);
				if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
					await fixNameClash(targetPath);
				}
			}
		} else if (entry.isDirectory()) {
			await fixNameClash(path.join(dir, entry.name));
		}
	}
}

// Start from the project root
fixNameClash(path.resolve(__dirname, '..'));
