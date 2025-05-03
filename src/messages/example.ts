import * as discord from 'discord.js';
import { MessageBuilder } from '../interfaces';

// Example message builder demonstrating basic message construction
export const example: MessageBuilder = {
	embeds: [
		new discord.EmbedBuilder()
			.setTitle('Example')
			.setDescription('This is an example message.'),
	],
	components: [new discord.ActionRowBuilder<discord.ButtonBuilder>()],
	async build(client) {
		// Example data to demonstrate custom ID generation
		const testJSON = {
			boolean: true,
			number: 1,
			string: 'test',
			array: [1, 2, 3],
		};
		// Add a test button with the example data
		this.components[0].addComponents(
			new discord.ButtonBuilder()
				.setCustomId(client.getCustomID('test-button', testJSON))
				.setLabel('Test Button')
				.setStyle(discord.ButtonStyle.Primary)
		);
		return {
			embeds: this.embeds,
			components: this.components,
		};
	},
};
