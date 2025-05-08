import { Client, MessageBuilder } from '@/core/interfaces';
import * as discord from 'discord.js';
import { createCustomId } from '@/core/utils/CustomIdUtils';
// import TestButton from '@/components/buttons/test'; // Uncomment if you have a test button component class

// Example message builder demonstrating basic message construction
export const example: MessageBuilder = {
	embeds: [
		new discord.EmbedBuilder()
			.setTitle('Example')
			.setDescription('This is an example message.'),
	],
	components: [new discord.ActionRowBuilder<discord.ButtonBuilder>()],
	async build(_client: Client, _data?: any, _sessionId?: string, locale: string = 'en-US') {
		// Example data to demonstrate custom ID generation
		const testJSON = {
			boolean: true,
			number: 1,
			string: 'test',
			array: [1, 2, 3],
		};
		// Use a button from the new component system if available
		// const button = await new TestButton().build(client, testJSON);
		// this.components[0].addComponents(button);
		// If no such class exists, fallback to a simple button for demonstration
		this.components[0].addComponents(
			new discord.ButtonBuilder()
				.setCustomId(createCustomId('test-button', { data: testJSON }))
				.setLabel(_client.getTranslation('example.button_label', locale))
				.setStyle(discord.ButtonStyle.Primary)
		);
		return {
			embeds: [
				new discord.EmbedBuilder()
					.setTitle(_client.getTranslation('example.title', locale))
					.setDescription(_client.getTranslation('example.description', locale)),
			],
			components: this.components,
		};
	},
};
