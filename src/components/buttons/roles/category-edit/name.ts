import { ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '@/core/interfaces/MessageComponent';
import { logger } from '@/core/logging/Logger';
import { RoleConfigFlow } from '@/flows/roles/RoleConfigFlow';

/**
 * Name Input - Triggers name input modal
 * Handles name button in role category edit menu
 */
export const MessageComponent: ButtonComponent = {
	id: 'roles:category-edit:name',
	type: ComponentTypes.Button,
	permissions: [PermissionFlagsBits.ManageRoles],

	async build(client, data: { category: string }) {
		logger.debug({ data }, 'Building name input button component with data');

		const button = new ButtonBuilder()
			.setCustomId(await client.getCustomID(this.id, data))
			.setLabel('Name')
			.setStyle(ButtonStyle.Secondary)
			.setEmoji('✏️');

		logger.debug('Name input button built successfully');
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
