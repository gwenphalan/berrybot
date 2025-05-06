import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import { logger } from '@/core/logging/Logger';

export interface CustomIdOptions {
	parent?: string;
	group?: string;
	data?: Record<string, any>;
	version?: string;
}

export interface ParsedCustomId<T = any> {
	id: string;
	parent?: string;
	group?: string;
	data?: T;
	version?: string;
}

/**
 * Creates a customId string for Discord components, always compressing data.
 * Format: [version:]parent:group:id[compressedData]
 * Only includes parent/group/version if provided.
 * Throws if the result exceeds 100 characters.
 */
export function createCustomId(id: string, options: CustomIdOptions = {}): string {
	const { parent, group, data, version } = options;
	let base = '';
	if (version) base += `${version}:`;
	if (parent) base += `${parent}:`;
	if (group) base += `${group}:`;
	base += id;

	let result = base;
	if (data && Object.keys(data).length > 0) {
		const json = JSON.stringify(data);
		const compressed = compressToUTF16(json);
		result += `[${compressed}]`;
	}

	if (result.length > 100) {
		throw new Error(
			`Custom ID exceeds Discord's 100 character limit: ${result.length} chars. Base: ${base}`
		);
	}
	return result;
}

/**
 * Parses a customId string into its parts and decompresses data if present.
 * Returns { id, parent, group, data, version }
 */
export function parseCustomId<T = any>(customId: string): ParsedCustomId<T> {
	// Regex: [version:]?(parent:)?(group:)?id[compressedData]?
	const regex = /^(?:(v\d+):)?(?:([^:]+):)?(?:([^:]+):)?([^[]+)(?:\[(.*)\])?$/;
	const match = regex.exec(customId);
	if (!match) {
		return { id: customId };
	}
	const [, version, parent, group, id, compressedData] = match;
	let data: T | undefined = undefined;
	if (compressedData) {
		try {
			const json = decompressFromUTF16(compressedData);
			data = json ? JSON.parse(json) : undefined;
		} catch (e) {
			logger.error(`Error decompressing data from customId: ${customId}. Error: ${e}`);
			data = undefined;
		}
	}
	return { id, parent, group, data, version };
}

/**
 * Type-safe extraction of data from a customId string.
 * Returns undefined if no data or parsing fails.
 */
export function getCustomIdData<T = any>(customId: string): T | undefined {
	const parsed = parseCustomId<T>(customId);
	return parsed.data;
}
