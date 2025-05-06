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

	async build(client: Client, _options: ModalBuildOptions<unknown>) {
		const field: TextInputOptions = {
			custom_id: 'test-modal-input',
			placeholder: 'Test Input',
			style: TextInputStyle.Short,
			label: 'Test Input',
		};
		return super.build(client, {
			title: this.title,
			fields: [field],
			data: {},
		});
	}

	async execute(
		interaction: ModalSubmitInteraction,
		_client: Client,
		fields: Map<string, { value: string }>
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
			content: `This is a test modal! You said: ${fields.get('test-modal-input')?.value}`,
			ephemeral: true,
		});
	}
}

export default TestModal;
