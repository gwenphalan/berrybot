import { ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '@/interfaces/MessageComponent';
import { logger } from '@/util';
import { RoleConfigFlow } from '@/flows/roles/RoleConfigFlow';

/**
 * Emoji Select - Triggers emoji select menu
 * Handles emoji button in role category edit menu
 */
export const MessageComponent: ButtonComponent = {
	id: 'roles:category-edit:emoji',
	type: ComponentTypes.Button,
	permissions: [PermissionFlagsBits.ManageRoles],

	async build(client, data: { category: string }) {
		logger.debug({ data }, 'Building emoji select button component with data');

		const button = new ButtonBuilder()
			.setCustomId(await client.getCustomID(this.id, data))
			.setLabel('Emoji')
			.setStyle(ButtonStyle.Secondary)
			.setEmoji('🎨');

		logger.debug('Emoji select button built successfully');
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
