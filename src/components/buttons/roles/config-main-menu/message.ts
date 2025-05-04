import { ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '@/interfaces/MessageComponent';
import { logger } from '@/util';
import { RoleConfigFlow } from '@/flows/roles/RoleConfigFlow';

/**
 * Send Message - Triggers message select menu
 * Handles message button in role category edit menu
 */
export const MessageComponent: ButtonComponent = {
	id: 'roles:config-main-menu:message',
	type: ComponentTypes.Button,
	permissions: [PermissionFlagsBits.ManageRoles],

	async build(client) {
		logger.debug('Building send message button component');

		const button = new ButtonBuilder()
			.setCustomId(await client.getCustomID(this.id))
			.setStyle(ButtonStyle.Primary)
			.setLabel('Send Role SelectionMessage')
			.setEmoji('📨');

		logger.debug('Send message button built successfully');
		return button;
	},

	async execute(interaction, client) {
		const flow = client.flowManager.getHandler<RoleConfigFlow>(interaction.message.id);
		logger.debug(this.id + 'button clicked with data');

		if (!flow) {
			logger.error('No flow found for message id', { messageId: interaction.message.id });
			return;
		}

		flow.handle(interaction, client);
	},
};

export default MessageComponent;
