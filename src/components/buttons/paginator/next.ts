import { ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '../../../interfaces/MessageComponent';
import { logger } from '../../../util';

export const NextButton: ButtonComponent = {
	id: 'button-id',
	type: ComponentTypes.Button,
	permissions: [PermissionFlagsBits.ManageRoles],

	async build(client) {
		logger.debug('Building button-id button component');

		const button = new ButtonBuilder()
			.setCustomId(
				await client.getCustomID(this.id, {
					// Add button data here
				})
			)
			.setLabel('Button Label')
			.setStyle(ButtonStyle.Primary);

		logger.debug('button-id button built successfully');
		return button;
	},

	async execute(interaction, _client, data) {
		logger.debug({ data }, 'button-id button clicked with data');
	},
};

export default NextButton;
