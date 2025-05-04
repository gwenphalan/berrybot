import { ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '@/interfaces/MessageComponent';
import { logger } from '@/util';
import { RoleConfigFlow } from '@/flows/roles/RoleConfigFlow';

/**
 * Delete Role Category - Deletes a role category
 * Handles delete button in role category edit menu
 */
export const MessageComponent: ButtonComponent = {
	id: 'roles:category-edit:delete',
	type: ComponentTypes.Button,
	permissions: [PermissionFlagsBits.ManageRoles],

	async build(client, data: { category: string }) {
		logger.debug({ data }, 'Building delete role category button component with data');

		const button = new ButtonBuilder()
			.setCustomId(await client.getCustomID(this.id, data))
			.setStyle(ButtonStyle.Danger)
			.setLabel('Delete')
			.setEmoji('🗑️');

		logger.debug('Delete button built successfully');
		return button;
	},

	async execute(interaction, client, data: { category: string }) {
		const flow = client.flowManager.getHandler<RoleConfigFlow>(interaction.message.id);
		logger.debug({ data }, this.id + 'button clicked with data');

		if (!flow) {
			logger.error('No flow found for message id', { messageId: interaction.message.id });
			return;
		}

		flow.handle(interaction, client, data);
	},
};

export default MessageComponent;
