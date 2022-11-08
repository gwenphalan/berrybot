// Button Interaction Handler
import loadFiles from '../../util/fileLoader';
import { Client } from '../../interfaces/Client';
import { Button } from '../../interfaces/button';

export async function loadButtons(client: Client) {
    const ascii = require('ascii-table');
    const table = new ascii().setHeading('Buttons', 'Status');

    await client.buttons.clear();

    const files = await loadFiles('ui-elements/buttons');

    files.forEach(f => {
        const button: Button = require(f);

        client.buttons.set(button.custom_id, button);

        return table.addRow(button.custom_id, '🟩');
    });

    console.log('\n' + table.toString());

    console.log('Buttons Loaded.');
}
