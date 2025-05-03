import { ButtonBuilder, ButtonStyle, ButtonInteraction } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '../../interfaces/MessageComponent';
import { Client } from '../../interfaces/Client';
import { logger } from '../../util/Logger';
import { ExampleFlow } from '../../flows/ExampleFlow';

// Button component for incrementing a counter in a flow
export const MessageComponent: ButtonComponent = {
	// Unique ID for this button component (used for routing interactions)
	id: 'counter',
	type: ComponentTypes.Button,

	// Builds the button to be shown in the message
	async build(client: Client, data: { count: number }) {
		logger.debug({ count: data.count }, 'Building counter button');
		return new ButtonBuilder()
			.setCustomId(client.getCustomID('counter', data)) // Custom ID for Discord to identify this button
			.setLabel('Click Me!') // Button label
			.setStyle(ButtonStyle.Primary); // Button color/style
	},

	// Handles button click interactions
	async execute(interaction: ButtonInteraction, client: Client, data: { count: number }) {
		logger.debug(
			{
				messageId: interaction.message.id,
				currentCount: data.count,
			},
			'Counter button clicked'
		);

		// Let the flow system handle the interaction
		await client.flowManager.handleInteraction(interaction);
	},
};
