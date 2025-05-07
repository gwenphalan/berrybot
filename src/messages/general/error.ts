// TODO: Locale Migration
// keys:
//   error.title: 'Uh Oh!'
//   error.occurred: 'An error occurred while processing your request.'
//   error.support_server: 'Support Server'
//   error.instructions: 'Please try again later or report this to the developers.'
//   error.error_id: 'Error ID'
//   error.time: 'Time'

import { Client, MessageBuilder } from '@/core/interfaces';
import * as discord from 'discord.js';
import { config } from '@/core/config/config';
import { randomUUID } from 'crypto';
import { t } from '@/core/utils/Locale';
// import TestButton from '@/components/buttons/test'; // Uncomment if you have a test button component class

// Example message builder demonstrating basic message construction
/**
 * Error message builder for command and flow errors.
 * Includes user-friendly instructions and a developer section with error details.
 * @param errorId Optional error ID for correlating user and log reports.
 */
export const error: MessageBuilder = {
	embeds: [],
	components: [],
	async build(client: Client, error: Error, errorId?: string, locale: string = 'en-US') {
		const id = errorId || randomUUID();
		const now = new Date();
		const generalTimestamp = now.toISOString().slice(0, 13).replace('T', ' '); // e.g., '2024-05-06 18'
		const container = new discord.ContainerBuilder().setAccentColor(
			client.utils.Color.hexToNumber('#ff0000')
		);
		const uhoh = new discord.TextDisplayBuilder().setContent(
			`# ${t('error.title', { locale })}`
		);

		const errorOccured = new discord.TextDisplayBuilder().setContent(
			t('error.occurred', { locale })
		);

		const errorIcon = new discord.ThumbnailBuilder().setURL(
			'https://cdn.unimatrix-01.dev/images/berrybot/developer.png'
		);

		const titleSection = new discord.SectionBuilder()
			.addTextDisplayComponents(uhoh, errorOccured)
			.setThumbnailAccessory(errorIcon);

		const separator = new discord.SeparatorBuilder().setDivider(true);

		const errorContent = new discord.TextDisplayBuilder().setContent(
			`\`\`\`${error.message}\`\`\``
		);

		const supportServer = new discord.ButtonBuilder()
			.setLabel(t('error.support_server', { locale }))
			.setStyle(discord.ButtonStyle.Link)
			.setURL(config.support_server);

		const instructions = new discord.TextDisplayBuilder().setContent(
			t('error.instructions', { locale })
		);

		// Developer info section (hidden in UI, but visible in logs or for advanced users)
		const developerInfo = new discord.TextDisplayBuilder().setContent(
			`**${t('error.error_id', { locale })}:** \`${id}\`\n**${t('error.time', { locale })}:** ${generalTimestamp}h UTC`
		);

		const instructionSection = new discord.SectionBuilder()
			.addTextDisplayComponents(instructions)
			.setButtonAccessory(supportServer);

		container
			.addSectionComponents(titleSection)
			.addSeparatorComponents(separator)
			.addTextDisplayComponents(errorContent)
			.addSeparatorComponents(separator)
			.addSectionComponents(instructionSection)
			.addSeparatorComponents(separator)
			.addTextDisplayComponents(developerInfo);

		return {
			flags: discord.MessageFlags.IsComponentsV2,
			components: [container],
		};
	},
};
