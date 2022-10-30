// test modal

import { Collection, ModalSubmitInteraction, TextInputComponent } from 'discord.js';
import { Modal } from '../../../interfaces/modal';

const modal: Modal = {
    custom_id: 'test-modal',
    async execute(interaction: ModalSubmitInteraction, fields: Collection<string, TextInputComponent>) {
        // Log the response to the console in a ascii table.
        console.log(
            '\n' + new (require('ascii-table'))().setHeading('Field', 'Response').addRow('test-modal-input', fields.get('test-modal-input')?.value).toString()
        );

        // Reply to the interaction with the response.
        interaction.reply({ content: `This is a test modal! You said: ${fields.get('test-modal-input')?.value}`, ephemeral: true });
    }
};

module.exports = modal;
