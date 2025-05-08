// Example modal component for testing modal functionality
import { ModalSubmitInteraction, TextInputStyle } from 'discord.js';
import { ModalComponent, ModalBuildOptions, TextInputOptions } from '@/core/classes/ModalComponent';
import type { Client } from '@/core/client/BerryClient';
import { logger } from '@/core/logging/Logger';
import AsciiTable from 'ascii-table';

/**
 * TestModal - Example modal component for testing modal functionality
 */
export class TestModal extends ModalComponent<unknown> {
	id = 'test-modal';
	title = 'Test Modal';
	fields = [];

	constructor() {
		super('Test Modal', []);
	}

	async build(
		client: Client,
		_options: ModalBuildOptions<unknown> = { data: {} },
		sessionId?: string,
		locale: string = 'en-US'
	) {
		const titleKey = 'modal.test.title';
		const labelKey = 'modal.test.label';
		const placeholderKey = 'modal.test.placeholder';
		const field: TextInputOptions = {
			custom_id: 'test-modal-input',
			placeholder: client.getTranslation(placeholderKey, locale),
			style: TextInputStyle.Short,
			label: client.getTranslation(labelKey, locale),
		};
		return super.build(
			client,
			{
				title: client.getTranslation(titleKey, locale),
				fields: [field],
				data: {},
			},
			sessionId,
			titleKey,
			locale
		);
	}

	async execute(
		interaction: ModalSubmitInteraction,
		client: Client,
		fields: Map<string, { value: string }>,
		locale: string = 'en-US'
	) {
		// Log modal response in a formatted table
		logger.info(
			'\n' +
				new AsciiTable()
					.setHeading('Field', 'Response')
					.addRow('test-modal-input', fields.get('test-modal-input')?.value)
					.toString()
		);

		// Reply to the interaction with the response
		interaction.reply({
			content: client.getTranslation('modal.test.reply', locale, {
				value: fields.get('test-modal-input')?.value ?? '',
			}),
			ephemeral: true,
		});
	}
}

export default TestModal;
