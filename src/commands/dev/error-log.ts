import {
	ChatInputCommandInteraction,
	MessageFlags,
	ContainerBuilder,
	SectionBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
} from 'discord.js';
import type { Command } from '@/core/interfaces/Command';
import { LocalizedSlashCommandBuilder } from '@/core/utils/Locale';
import { ErrorLog as ErrorLogModel, type ErrorLog } from '@/database/ErrorLog';
import { logger } from '@/core/logging/Logger';
import { z } from 'zod';
import { errorLog } from '@/messages/general/error-log';

// Zod schema for UUID validation
const uuidSchema = z.string().uuid();

/**
 * Builds a Discord components v2 error log message for a given error log entry.
 * @param log The error log object
 * @param client The BerryClient instance
 * @returns The ContainerBuilder instance for the error log
 */
export function buildErrorLogMessage(log: Partial<ErrorLog>, client: any) {
	const title = new TextDisplayBuilder().setContent('# Error Log');
	const createdAt = log.createdAt ? new Date(log.createdAt) : new Date();
	const meta = new TextDisplayBuilder().setContent(
		`**ID:** \`${log.errorId}\`\n` +
			`**Command:** \`${log.command}${log.subcommand ? '.' + log.subcommand : ''}\`\n` +
			`**User:** <@${log.user}>\n` +
			`**Guild:** ${log.guild ? log.guild : 'DM'}\n` +
			`**Created:** <t:${Math.floor(createdAt.getTime() / 1000)}:F>`
	);
	const errorIcon = new ThumbnailBuilder().setURL(
		'https://cdn.unimatrix-01.dev/images/berrybot/developer.png'
	);
	const titleSection = new SectionBuilder()
		.addTextDisplayComponents(title, meta)
		.setThumbnailAccessory(errorIcon);

	// Error message and stack trace
	const errorMessage = new TextDisplayBuilder().setContent(
		`**Message:**\n\u200B\n\`\`\`${log.errorMessage}\`\`\``
	);
	const stackTraceStr = log.stackTrace ?? '';
	const stackTrace = new TextDisplayBuilder().setContent(
		`**Stack Trace:**\n\u200B\n\`\`\`${stackTraceStr.slice(0, 1500)}${stackTraceStr.length > 1500 ? '\n...truncated' : ''}\`\`\``
	);

	// Container
	const container = new ContainerBuilder().setAccentColor(
		client.utils.Color.hexToNumber('#00BFFF')
	);
	container
		.addSectionComponents(titleSection)
		.addTextDisplayComponents(errorMessage)
		.addTextDisplayComponents(stackTrace);
	return container;
}

const command: Command = {
	data: new LocalizedSlashCommandBuilder()
		.setName('error-log')
		.setDescription('Fetch an error log by UUID (developer only)')
		.addStringOption((option) =>
			option.setName('uuid').setDescription('The error log UUID').setRequired(true)
		)
		.setDefaultMemberPermissions(0),
	developer: true,
	async execute(interaction: ChatInputCommandInteraction, client) {
		const uuid = interaction.options.getString('uuid', true);
		logger.debug({ uuid }, '[ErrorLogCommand] Received /error-log command');

		// Validate UUID
		const parseResult = uuidSchema.safeParse(uuid);
		if (!parseResult.success) {
			logger.warn({ uuid }, '[ErrorLogCommand] Invalid UUID provided');
			await interaction.reply({
				content: 'Invalid UUID format. Please provide a valid error log UUID.',
				ephemeral: true,
			});
			return;
		}

		await interaction.deferReply({ ephemeral: true });
		// Fetch error log from DB
		const log: ErrorLog | null = await ErrorLogModel.findOne({ errorId: uuid }).lean();
		if (!log) {
			logger.warn({ uuid }, '[ErrorLogCommand] No error log found for UUID');
			await interaction.editReply({
				content: `No error log found for ID: \`${uuid}\``,
			});
			return;
		}
		logger.debug({ uuid, log }, '[ErrorLogCommand] Found error log');

		// --- Build Discord components v2 message using the shared errorLog builder ---
		const errorObj = new Error(log.errorMessage);
		errorObj.stack = log.stackTrace;
		const errorLogMsg = await errorLog.build(client, errorObj, log.errorId, {
			command: log.command,
			subcommand: log.subcommand,
			user: log.user,
			guild: log.guild,
			createdAt: log.createdAt,
		});
		await interaction.editReply(errorLogMsg);
	},
};

export default command;
