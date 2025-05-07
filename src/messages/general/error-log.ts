// TODO: Locale Migration
// keys:
//   error_log.title: 'Error Log'
//   error_log.id: 'ID'
//   error_log.command: 'Command'
//   error_log.user: 'User'
//   error_log.guild: 'Guild'
//   error_log.created: 'Created'
//   error_log.message: 'Message:'
//   error_log.stack_trace: 'Stack Trace:'
//   error_log.developer_info: 'Error ID'
//   error_log.time: 'Time'

import { MessageBuilder } from '@/core/interfaces/MessageBuilder';
import * as discord from 'discord.js';
import { config } from '@/core/config/config';
import { t } from '@/core/utils/Locale';

/**
 * Error log message builder for reporting errors to the error log channel.
 * Includes error message, stack trace, and context metadata.
 * @param error The error object
 * @param errorId The error UUID
 * @param context Additional context: { command, subcommand, user, guild, createdAt }
 */
export const errorLog: MessageBuilder = {
	embeds: [],
	components: [],
	async build(
		client: any,
		error: Error,
		errorId: string,
		context: {
			command?: string;
			subcommand?: string;
			user?: string;
			guild?: string | null;
			createdAt?: Date;
		} = {},
		locale: string = 'en-US'
	) {
		const now = context.createdAt || new Date();
		const container = new discord.ContainerBuilder().setAccentColor(
			client.utils.Color.hexToNumber('#ff0000')
		);
		const title = new discord.TextDisplayBuilder().setContent(
			`# ${t('error_log.title', { locale })}`
		);
		const meta = new discord.TextDisplayBuilder().setContent(
			`**${t('error_log.id', { locale })}:** \`${errorId}\`\n` +
				`**${t('error_log.command', { locale })}:** \`${context.command || 'unknown'}${context.subcommand ? '.' + context.subcommand : ''}\`\n` +
				`**${t('error_log.user', { locale })}:** <@${context.user || 'unknown'}>\n` +
				`**${t('error_log.guild', { locale })}:** ${context.guild ? context.guild : 'DM'}\n` +
				`**${t('error_log.created', { locale })}:** <t:${Math.floor(now.getTime() / 1000)}:F>`
		);
		const errorIcon = new discord.ThumbnailBuilder().setURL(
			'https://cdn.unimatrix-01.dev/images/berrybot/developer.png'
		);
		const titleSection = new discord.SectionBuilder()
			.addTextDisplayComponents(title, meta)
			.setThumbnailAccessory(errorIcon);

		const separator = new discord.SeparatorBuilder().setDivider(true);

		const errorMessage = new discord.TextDisplayBuilder().setContent(
			`**${t('error_log.message', { locale })}**\n\u200B\n\`\`\`${error.message}\`\`\``
		);
		const stackTrace = new discord.TextDisplayBuilder().setContent(
			`**${t('error_log.stack_trace', { locale })}**\n\u200B\n\`\`\`${error.stack ? error.stack.slice(0, 1500) : ''}${error.stack && error.stack.length > 1500 ? '\n...truncated' : ''}\`\`\``
		);

		const developerInfo = new discord.TextDisplayBuilder().setContent(
			`**${t('error_log.developer_info', { locale })}:** \`${errorId}\`\n**${t('error_log.time', { locale })}:** ${now.toISOString().slice(0, 13).replace('T', ' ')}h UTC`
		);

		container
			.addSectionComponents(titleSection)
			.addSeparatorComponents(separator)
			.addTextDisplayComponents(errorMessage)
			.addSeparatorComponents(separator)
			.addTextDisplayComponents(stackTrace)
			.addSeparatorComponents(separator)
			.addTextDisplayComponents(developerInfo);

		return {
			flags: discord.MessageFlags.IsComponentsV2,
			components: [container],
		};
	},
};
