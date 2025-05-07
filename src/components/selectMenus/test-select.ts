// TODO: Locale Migration
// keys:
//   select.test.placeholder: 'Test Select'
//   select.test.option1: 'Test Option 1'
//   select.test.option2: 'Test Option 2'
//   select.test.option3: 'Test Option 3'
//   select.test.reply: 'You selected {{label}}'

// Example single-select menu component for testing purposes
import { StringSelectMenuInteraction, APISelectMenuOption } from 'discord.js';
import { StringSelectMenuComponent } from '@/core/classes/StringSelectMenuComponent';
import type { Client } from '@/core/client/BerryClient';
import { t } from '@/core/utils/Locale';

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
		const placeholder = t(placeholderKey, { locale });
		const select = await super.build(
			client,
			{
				placeholder,
				min_values: this.min_values,
				max_values: this.max_values,
				options: [
					{ label: t('select.test.option1', { locale }), value: 'test-option-1' },
					{ label: t('select.test.option2', { locale }), value: 'test-option-2' },
					{ label: t('select.test.option3', { locale }), value: 'test-option-3' },
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
			content: t('select.test.reply', { locale, variables: { label: selected.label } }),
			ephemeral: true,
		});
	}
}

export default TestSelectMenu;
