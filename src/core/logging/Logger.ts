import pino from 'pino';
import { join } from 'path';
import { execSync } from 'child_process';
import { existsSync, renameSync, mkdirSync } from 'fs';
import type { Logger } from 'pino';

// Force UTF-8 encoding for Windows to ensure proper emoji and special character display
if (process.platform === 'win32') {
	try {
		execSync('chcp 65001', { stdio: 'ignore' });
	} catch {
		// Ignore error if command fails
	}
}

// Determine if we're in development mode for appropriate logging levels
const isDev = process.env.NODE_ENV !== 'production';

// Ensure log directory exists
const logDir = join(process.cwd(), 'log');
if (!existsSync(logDir)) {
	mkdirSync(logDir, { recursive: true });
}

// Archive existing latest.log if it exists
const latestLogPath = join(logDir, 'latest.log');
if (existsSync(latestLogPath)) {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const archivePath = join(logDir, `log-${timestamp}.log`);
	try {
		renameSync(latestLogPath, archivePath);
	} catch (error) {
		// If rename fails, log to console and continue
		console.error('Failed to archive previous log file:', error);
	}
}

// Create the base logger configuration
const logger = pino({
	level: isDev ? 'debug' : 'info',
	transport: {
		targets: [
			// Console output with pretty printing
			{
				target: 'pino-pretty',
				level: isDev ? 'debug' : 'info',
				options: {
					colorize: true,
					translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
					ignore: 'pid,hostname',
					messageFormat: '{msg}',
					levelFirst: true,
					destination: 1,
					messageKey: 'msg',
					errorLikeObjectKeys: ['err', 'error'],
					errorProps: '*', // Include all error properties
					crlf: true,
					singleLine: false,
					hideObject: false,
					minimumLevel: 'debug',
				},
			},
			// File output for latest.log with pretty printing
			{
				target: 'pino-pretty',
				level: isDev ? 'debug' : 'info',
				options: {
					colorize: false,
					translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
					ignore: 'pid,hostname',
					messageFormat: '{msg}',
					levelFirst: true,
					destination: latestLogPath,
					messageKey: 'msg',
					errorLikeObjectKeys: ['err', 'error'],
					errorProps: '*', // Include all error properties
					crlf: true,
					singleLine: false,
					hideObject: false,
					minimumLevel: 'debug',
				},
			},
			// File output for error.log with pretty printing
			{
				target: 'pino-pretty',
				level: 'error',
				options: {
					colorize: false,
					translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
					ignore: 'pid,hostname',
					messageFormat: '{msg}',
					levelFirst: true,
					destination: join(logDir, 'error.log'),
					messageKey: 'msg',
					errorLikeObjectKeys: ['err', 'error'],
					errorProps: '*', // Include all error properties
					crlf: true,
					singleLine: false,
					hideObject: false,
					minimumLevel: 'error',
				},
			},
		],
	},
});

// Create a stream object for Morgan HTTP request logging integration
const stream = {
	write: (message: string) => {
		logger.info(message.trim());
	},
};

// Export color codes for consistent console output formatting
export const color = {
	// Muted/Dark Colors
	charcoal: '#k',
	navyMist: '#n',
	sage: '#s',
	teal: '#t',
	rose: '#r',
	periwinkle: '#p',
	champagne: '#c',
	pearlGray: '#g',
	doveGray: '#d',
	babyBlue: '#b',
	mint: '#m',
	aquaMist: '#a',
	vintageRose: '#v',
	lavender: '#l',
	honey: '#h',
	whiteSmoke: '#w',

	// Text Formatting
	reset: '#0',
	bold: '#B',
	underline: '#U',
	italic: '#I',
	obfuscated: '#O',
};

// Type for prettyError details
export interface PrettyErrorDetails {
	errorId: string;
	command: string;
	subcommand?: string | null;
	user: string;
	guild?: string | null;
	message: string;
	error: Error | string;
}

/**
 * Prints a visually separated, colored error block to the console and logs the error to the log file.
 * Use for command/interaction errors where you want both pretty console output and persistent logging.
 * @param logger The logger instance to use for file logging
 * @param details Object with errorId, command, subcommand, user, guild, message, error (Error or string)
 */
export function prettyError(logger: Logger, details: PrettyErrorDetails) {
	const { errorId, command, subcommand, user, guild, message, error } = details;
	const red = '\x1b[31m';
	const yellow = '\x1b[33m';
	const cyan = '\x1b[36m';
	const reset = '\x1b[0m';
	console.error(`\n${red}================= COMMAND ERROR =================${reset}`);
	console.error(`${yellow}Error ID:${reset}     ${cyan}${errorId}${reset}`);
	console.error(
		`${yellow}Command:${reset}      ${cyan}${command}${subcommand ? `.${subcommand}` : ''}${reset}`
	);
	console.error(`${yellow}User:${reset}         ${cyan}${user}${reset}`);
	console.error(`${yellow}Guild:${reset}        ${cyan}${guild || 'DM'}${reset}`);
	console.error(`${yellow}Message:${reset}      ${red}${message}${reset}`);
	console.error(`${red}-----------------------------------------------${reset}`);
	if (error instanceof Error && error.stack) {
		console.error(error.stack);
	} else if (typeof error === 'string') {
		console.error(error);
	}
	console.error(`${red}===============================================${reset}\n`);
	// Log to file as well
	logger.error(
		{ errorId, command, subcommand, user, guild, message, error },
		'Error executing command'
	);
}

export { logger, stream };
