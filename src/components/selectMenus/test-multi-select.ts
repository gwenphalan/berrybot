// TODO: Locale Migration
// keys:
//   select.test_multi.placeholder: 'Test Select'
//   select.test_multi.option1: 'Test Option 1'
//   select.test_multi.option2: 'Test Option 2'
//   select.test_multi.option3: 'Test Option 3'
//   select.test_multi.reply: 'You selected {{labels}}'

// Example multi-select menu component for testing purposes
import { StringSelectMenuInteraction, APISelectMenuOption } from 'discord.js';
import { StringSelectMenuComponent } from '@/core/classes/StringSelectMenuComponent';
import type { Client } from '@/core/client/BerryClient';
import { t } from '@/core/utils/Locale';

class TestMultiSelectMenu extends StringSelectMenuComponent<object> {
	id = 'test-multi-select';
	min_values = 1;
	max_values = 3;

	async build(
		client: Client,
		options: { data: object },
		sessionId?: string,
		locale: string = 'en-US'
	) {
		const placeholderKey = 'select.test_multi.placeholder';
		const placeholder = t(placeholderKey, { locale });
		const select = await super.build(
			client,
			{
				placeholder,
				min_values: this.min_values,
				max_values: this.max_values,
				options: [
					{ label: t('select.test_multi.option1', { locale }), value: 'test-option-1' },
					{ label: t('select.test_multi.option2', { locale }), value: 'test-option-2' },
					{ label: t('select.test_multi.option3', { locale }), value: 'test-option-3' },
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
		selected: APISelectMenuOption[],
		_data: object,
		locale: string = 'en-US'
	) {
		await interaction.reply({
			content: t('select.test_multi.reply', {
				locale,
				variables: { labels: selected.map((option) => option.label).join(', ') },
			}),
			ephemeral: true,
		});
	}
}

export default TestMultiSelectMenu;
