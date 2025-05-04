import { ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '@/interfaces/MessageComponent';
import { logger } from '@/util';
import { RoleConfigFlow } from '@/flows/roles/RoleConfigFlow';

/**
 * Edit Role Category - Triggers select menu for role categories to edit
 * Handles edit button in role category edit menu
 */
export const MessageComponent: ButtonComponent = {
	id: 'roles:config-main-menu:edit',
	type: ComponentTypes.Button,
	permissions: [PermissionFlagsBits.ManageRoles],

	async build(client) {
		logger.debug('Building create role category button component');

		const button = new ButtonBuilder()
			.setCustomId(await client.getCustomID(this.id))
			.setStyle(ButtonStyle.Secondary)
			.setLabel('Edit')
			.setEmoji('✏️');

		logger.debug('Edit button built successfully');
		return button;
	},

	async execute(interaction, client) {
		const flow = client.flowManager.getHandler<RoleConfigFlow>(interaction.message.id);
		logger.debug(this.id + 'button clicked with data');

		if (!flow) {
			logger.error('No flow found for message id', { messageId: interaction.message.id });
			return;
		}

		await flow.handle(interaction, client);
	},
};

export default MessageComponent;
