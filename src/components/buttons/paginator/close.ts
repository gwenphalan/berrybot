import { ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '../../../interfaces/MessageComponent';
import { logger } from '../../../util';

export const MessageComponent: ButtonComponent = {
	id: 'paginator.close',
	type: ComponentTypes.Button,
	permissions: [PermissionFlagsBits.ManageRoles],

	async build(client) {
		logger.debug('Building paginator.close button component');

		const button = new ButtonBuilder()
			.setCustomId(this.id)
			.setLabel('Close')
			.setStyle(ButtonStyle.Danger);

		logger.debug('paginator.close button built successfully');
		return button;
	},

	async execute(interaction, _client, data) {
		logger.debug({ data }, 'paginator.close button clicked with data');
		logger.debug({ messageId: interaction.message.id }, 'Deleting paginator message');
		interaction.message.delete();
	},
};

export default MessageComponent;
