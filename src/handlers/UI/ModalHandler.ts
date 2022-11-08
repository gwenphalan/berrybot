// Modal Interaction Handler

import fileLoader from '../../util/fileLoader';
import { Client } from '../../interfaces/Client';
import { Modal } from '../../interfaces/modal';

export async function loadModals(client: Client) {
    const ascii = require('ascii-table');
    const table = new ascii().setHeading('Modals', 'Status');

    await client.modals.clear();

    const files = await fileLoader('ui-elements/modals');

    files.forEach(f => {
        const modal: Modal = require(f);

        client.modals.set(modal.custom_id, modal);

        return table.addRow(modal.custom_id, '🟩');
    });

    console.log('\n' + table.toString());

    console.log('Modals Loaded.');
}
