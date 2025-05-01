import pino from 'pino';
import { join } from 'path';
import { execSync } from 'child_process';

// Force UTF-8 encoding for Windows
if (process.platform === 'win32') {
	try {
		execSync('chcp 65001', { stdio: 'ignore' });
	} catch (error) {
		// Ignore error if command fails
	}
}

// Determine if we're in development mode
const isDev = process.env.NODE_ENV !== 'production';

// Create the base logger configuration
const logger = pino({
	level: isDev ? 'debug' : 'info',
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
			translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
			ignore: 'pid,hostname',
			messageFormat: '{msg}',
			levelFirst: true,
			destination: 1, // stdout with proper encoding
		},
	},
});

// Create file streams for production
if (!isDev) {
	// Create child loggers with their respective streams
	const errorLogger = pino(
		{
			level: 'error',
		},
		pino.destination({
			dest: join(process.cwd(), 'logs', 'error.log'),
			sync: false,
			mkdir: true,
		})
	);

	const combinedLogger = pino(
		{
			level: 'info',
		},
		pino.destination({
			dest: join(process.cwd(), 'logs', 'combined.log'),
			sync: false,
			mkdir: true,
		})
	);

	// Override the error method to write to both streams
	logger.error = function (obj: any, msg?: string, ...args: any[]) {
		errorLogger.error(obj, msg, ...args);
		combinedLogger.error(obj, msg, ...args);
		return this;
	};

	// Override other methods to write to combined stream
	logger.warn = function (obj: any, msg?: string, ...args: any[]) {
		combinedLogger.warn(obj, msg, ...args);
		return this;
	};

	logger.info = function (obj: any, msg?: string, ...args: any[]) {
		combinedLogger.info(obj, msg, ...args);
		return this;
	};

	logger.debug = function (obj: any, msg?: string, ...args: any[]) {
		combinedLogger.debug(obj, msg, ...args);
		return this;
	};
}

// Create a stream object for Morgan integration
const stream = {
	write: (message: string) => {
		logger.info(message.trim());
	},
};

// Export color codes for use in other files
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

	// Formatting
	reset: '#0',
	bold: '#B',
	underline: '#U',
	italic: '#I',
	obfuscated: '#O',
};

export { logger, stream };
