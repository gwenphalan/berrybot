import { MessageBuilder } from '@/core/interfaces/MessageBuilder';
import * as discord from 'discord.js';
import { config } from '@/core/config/config';

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
		} = {}
	) {
		const now = context.createdAt || new Date();
		const container = new discord.ContainerBuilder().setAccentColor(
			client.utils.Color.hexToNumber('#ff0000')
		);
		const title = new discord.TextDisplayBuilder().setContent('# Error Log');
		const meta = new discord.TextDisplayBuilder().setContent(
			`**ID:** \`${errorId}\`\n` +
				`**Command:** \`${context.command || 'unknown'}${context.subcommand ? '.' + context.subcommand : ''}\`\n` +
				`**User:** <@${context.user || 'unknown'}>\n` +
				`**Guild:** ${context.guild ? context.guild : 'DM'}\n` +
				`**Created:** <t:${Math.floor(now.getTime() / 1000)}:F>`
		);
		const errorIcon = new discord.ThumbnailBuilder().setURL(
			'https://cdn.unimatrix-01.dev/images/berrybot/developer.png'
		);
		const titleSection = new discord.SectionBuilder()
			.addTextDisplayComponents(title, meta)
			.setThumbnailAccessory(errorIcon);

		const separator = new discord.SeparatorBuilder().setDivider(true);

		const errorMessage = new discord.TextDisplayBuilder().setContent(
			`**Message:**\n\u200B\n\`\`\`${error.message}\`\`\``
		);
		const stackTrace = new discord.TextDisplayBuilder().setContent(
			`**Stack Trace:**\n\u200B\n\`\`\`${error.stack ? error.stack.slice(0, 1500) : ''}${error.stack && error.stack.length > 1500 ? '\n...truncated' : ''}\`\`\``
		);

		const developerInfo = new discord.TextDisplayBuilder().setContent(
			`**Error ID:** \`${errorId}\`\n**Time:** ${now.toISOString().slice(0, 13).replace('T', ' ')}h UTC`
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
