import { ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '@/core/interfaces/MessageComponent';
import { logger } from '@/core/logging/Logger';

// Example button component for testing custom ID data handling
export const MessageComponent: ButtonComponent = {
	id: 'test-button',
	type: ComponentTypes.Button,
	permissions: [PermissionFlagsBits.ManageEvents, PermissionFlagsBits.ManageRoles],

	async build(client) {
		logger.debug('Building test button component');

		// Example JSON data to demonstrate custom ID serialization
		const testJSON = {
			type: 'modal',
			id: 'mod_history',
			userId: '123456789012345678',
			page: 2,
			filters: {
				sort: 'recent',
				category: 'moderation',
				tags: ['bans', 'kicks', 'mutes'],
				priority: 'high',
				resolved: false,
			},
		};

		// Create a primary button with serialized data in custom ID
		const button = new ButtonBuilder()
			.setCustomId(await client.getCustomID(this.id, testJSON))
			.setLabel('Test Button')
			.setStyle(ButtonStyle.Primary);

		logger.debug('Test button built successfully');
		return button;
	},

	execute(
		interaction,
		_client,
		data: {
			boolean: boolean;
			number: number;
			string: string;
			array: number[];
		}
	) {
		// Log received data and respond to interaction
		logger.debug({ data }, 'Test button clicked with data');

		interaction.reply({
			content: `This is a test button!`,
			ephemeral: true,
		});
	},
};

export default MessageComponent;
