import { ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '@/core/interfaces/MessageComponent';
import { logger } from '@/core/logging/Logger';
import { RoleConfigFlow } from '@/flows/roles/RoleConfigFlow';

/**
 * Create Role Category - Triggers create role category modal
 * Handles create button in role category edit menu
 */
export const MessageComponent: ButtonComponent = {
	id: 'roles:config-main-menu:create',
	type: ComponentTypes.Button,
	permissions: [PermissionFlagsBits.ManageRoles],

	async build(client) {
		logger.debug('Building create role category button component');

		const button = new ButtonBuilder()
			.setCustomId(await client.getCustomID(this.id))
			.setStyle(ButtonStyle.Success)
			.setLabel('Create')
			.setEmoji('➕');

		logger.debug('Create button built successfully');
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
