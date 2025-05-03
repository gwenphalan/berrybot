import pino from 'pino';
import { join } from 'path';
import { execSync } from 'child_process';
import { existsSync, renameSync, mkdirSync } from 'fs';

// Force UTF-8 encoding for Windows to ensure proper emoji and special character display
if (process.platform === 'win32') {
	try {
		execSync('chcp 65001', { stdio: 'ignore' });
	} catch (error) {
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
					errorProps: 'message,stack,code,type',
					crlf: true,
					singleLine: false,
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
					errorProps: 'message,stack,code,type',
					crlf: true,
					singleLine: false,
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
					errorProps: 'message,stack,code,type',
					crlf: true,
					singleLine: false,
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

export { logger, stream };
