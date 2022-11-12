// test modal

import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ModalComponent, ComponentTypes } from '../../interfaces/MessageComponent';

export const MessageComponent: ModalComponent = {
    id: 'test-modal',
    type: ComponentTypes.Modal,

    async build(_client) {
        const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder().setCustomId('test-modal-input').setPlaceholder('Test Input').setStyle(TextInputStyle.Short).setLabel('Test Input')
        );
        return new ModalBuilder().setTitle('Test Modal').setCustomId('test-modal').setComponents([row]);
    },

    async execute(interaction, _client, fields) {
        // Log the response to the console in a ascii table.
        console.log(
            '\n' + new (require('ascii-table'))().setHeading('Field', 'Response').addRow('test-modal-input', fields.get('test-modal-input')?.value).toString()
        );

        // Reply to the interaction with the response.
        interaction.reply({ content: `This is a test modal! You said: ${fields.get('test-modal-input')?.value}`, ephemeral: true });
    }
};

export default MessageComponent;
