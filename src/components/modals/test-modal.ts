// test modal

import { ModalComponent, ComponentTypes } from '../../interfaces/MessageComponent';

const modal: ModalComponent = {
    id: 'test-modal',
    type: ComponentTypes.Modal,
    async execute(interaction, _client, fields) {
        // Log the response to the console in a ascii table.
        console.log(
            '\n' + new (require('ascii-table'))().setHeading('Field', 'Response').addRow('test-modal-input', fields.get('test-modal-input')?.value).toString()
        );

        // Reply to the interaction with the response.
        interaction.reply({ content: `This is a test modal! You said: ${fields.get('test-modal-input')?.value}`, ephemeral: true });
    }
};

module.exports = modal;
