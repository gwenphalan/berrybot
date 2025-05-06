// Example single-select menu component for testing purposes
import { StringSelectMenuInteraction, APISelectMenuOption } from 'discord.js';
import { StringSelectMenuComponent } from '@/core/classes/StringSelectMenuComponent';
import type { Client } from '@/core/client/BerryClient';

class TestSelectMenu extends StringSelectMenuComponent<object> {
	id = 'test-select';
	placeholder = 'Test Select';
	min_values = 1;
	max_values = 1;

	async build(client: Client, options: { data: object }) {
		const select = await super.build(client, {
			placeholder: this.placeholder,
			min_values: this.min_values,
			max_values: this.max_values,
			options: [
				{ label: 'Test Option 1', value: 'test-option-1' },
				{ label: 'Test Option 2', value: 'test-option-2' },
				{ label: 'Test Option 3', value: 'test-option-3' },
			],
			data: options.data,
		});
		return select;
	}

	async execute(
		interaction: StringSelectMenuInteraction,
		client: Client,
		selected: APISelectMenuOption,
		_data: object
	) {
		await interaction.reply({ content: `You selected ${selected.label}`, ephemeral: true });
	}
}

export default TestSelectMenu;
