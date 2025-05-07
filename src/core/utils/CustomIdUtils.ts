import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import { logger } from '@/core/logging/Logger';

export interface CustomIdOptions {
	parent?: string;
	group?: string;
	data?: Record<string, any>;
	version?: string;
	sessionId?: string;
}

export interface ParsedCustomId<T = any> {
	id: string;
	parent?: string;
	group?: string;
	data?: T;
	version?: string;
	sessionId?: string;
}

/**
 * Creates a customId string for Discord components, always compressing data.
 * Format: [version:]parent:group:id[compressedData]
 * Only includes parent/group/version if provided.
 * Throws if the result exceeds 100 characters.
 * If sessionId is provided, it is included in the data payload.
 */
export function createCustomId(id: string, options: CustomIdOptions = {}): string {
	logger.debug({ id, options }, '[CustomIdUtils.createCustomId] Called with');
	const { parent, group, data, version, sessionId } = options;
	let base = '';
	if (version) base += `${version}:`;
	if (parent) base += `${parent}:`;
	if (group) base += `${group}:`;
	base += id;

	let result = base;
	const dataWithSession = data ? { ...data } : {};
	if (sessionId) {
		dataWithSession.sessionId = sessionId;
	}
	if (dataWithSession && Object.keys(dataWithSession).length > 0) {
		const json = JSON.stringify(dataWithSession);
		const compressed = compressToUTF16(json);
		logger.debug({ json, compressed }, '[CustomIdUtils.createCustomId] Compressed data');
		result += `[${compressed}]`;
	}
	logger.debug({ result }, '[CustomIdUtils.createCustomId] Final customId');

	if (result.length > 100) {
		throw new Error(
			`Custom ID exceeds Discord's 100 character limit: ${result.length} chars. Base: ${base}`
		);
	}
	return result;
}

/**
 * Parses a customId string into its parts and decompresses data if present.
 * Returns { id, parent, group, data, version, sessionId }
 */
export function parseCustomId<T = any>(customId: string): ParsedCustomId<T> {
	logger.debug({ customId }, '[CustomIdUtils.parseCustomId] Called with');
	// Regex: [version:]?(parent:)?(group:)?id[compressedData]?
	const regex = /^(?:(v\d+):)?(?:([^:]+):)?(?:([^:]+):)?([^[]+)(?:\[(.*)\])?$/;
	const match = regex.exec(customId);
	if (!match) {
		logger.debug(
			{ parsed: { id: customId } },
			'[CustomIdUtils.parseCustomId] No match, returning'
		);
		return { id: customId };
	}
	const [, version, parent, group, id, compressedData] = match;
	let data: T | undefined = undefined;
	let sessionId: string | undefined = undefined;
	if (compressedData) {
		try {
			const json = decompressFromUTF16(compressedData);
			logger.debug(
				{ compressedData, json },
				'[CustomIdUtils.parseCustomId] Decompressed data'
			);
			data = json ? JSON.parse(json) : undefined;
			if (data && typeof data === 'object' && 'sessionId' in data) {
				if (typeof data.sessionId === 'string') {
					sessionId = data.sessionId;
				}
			}
		} catch (e) {
			logger.error(`Error decompressing data from customId: ${customId}. Error: ${e}`);
			data = undefined;
		}
	}
	const parsed = { id, parent, group, data, version, sessionId };
	logger.debug({ parsed }, '[CustomIdUtils.parseCustomId] Parsed result');
	return parsed;
}

/**
 * Type-safe extraction of data from a customId string.
 * Returns undefined if no data or parsing fails.
 */
export function getCustomIdData<T = any>(customId: string): T | undefined {
	const parsed = parseCustomId<T>(customId);
	return parsed.data;
}
