// Example single-select menu component for testing purposes
import { StringSelectMenuInteraction, APISelectMenuOption } from 'discord.js';
import { StringSelectMenuComponent } from '@/core/classes/StringSelectMenuComponent';
import type { Client } from '@/core/client/BerryClient';

class TestSelectMenu extends StringSelectMenuComponent<object> {
	id = 'test-select';
	min_values = 1;
	max_values = 1;

	async build(
		client: Client,
		options: { data: object },
		sessionId?: string,
		locale: string = 'en-US'
	) {
		const placeholderKey = 'select.test.placeholder';
		const placeholder = client.getTranslation(placeholderKey, locale);
		const select = await super.build(
			client,
			{
				placeholder,
				min_values: this.min_values,
				max_values: this.max_values,
				options: [
					{
						label: client.getTranslation('select.test.option1', locale),
						value: 'test-option-1',
					},
					{
						label: client.getTranslation('select.test.option2', locale),
						value: 'test-option-2',
					},
					{
						label: client.getTranslation('select.test.option3', locale),
						value: 'test-option-3',
					},
				],
				data: options.data,
			},
			sessionId,
			placeholderKey,
			locale
		);
		return select;
	}

	async execute(
		interaction: StringSelectMenuInteraction,
		client: Client,
		selected: APISelectMenuOption,
		_data: object,
		locale: string = 'en-US'
	) {
		await interaction.reply({
			content: client.getTranslation('select.test.reply', locale, { label: selected.label }),
			ephemeral: true,
		});
	}
}

export default TestSelectMenu;
