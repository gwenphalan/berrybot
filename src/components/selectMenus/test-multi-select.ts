// Example multi-select menu component for testing purposes
import { StringSelectMenuBuilder } from 'discord.js';
import { ComponentTypes, SelectMenuComponent } from '../../interfaces/MessageComponent';

export const MessageComponent: SelectMenuComponent = {
	id: 'test-multi-select',
	type: ComponentTypes.SelectMenu,
	multi_select: true,

	async build(_client) {
		// Create a test menu with 3 options, allowing 1-3 selections
		return new StringSelectMenuBuilder()
			.setCustomId('test-select')
			.setPlaceholder('Test Select')
			.setMinValues(1)
			.setMaxValues(3)
			.addOptions([
				{
					label: 'Test Option 1',
					value: 'test-option-1',
				},
				{
					label: 'Test Option 2',
					value: 'test-option-2',
				},
				{
					label: 'Test Option 3',
					value: 'test-option-3',
				},
			]);
	},

	execute(interaction, _client, selected) {
		// Display selected options in a comma-separated list
		interaction.reply({
			content: `You selected ${selected.map((option) => option.label).join(', ')}`,
			ephemeral: true,
		});
	},
};

export default MessageComponent;
