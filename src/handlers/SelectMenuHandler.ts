// Select Menu Interaction Handler

import loadFiles from '../util/fileLoader';
import { Client } from '../interfaces/Client';
import { SelectMenu } from '../interfaces/selectMenu';

export async function loadSelectMenus(client: Client) {
    const ascii = require('ascii-table');
    const table = new ascii().setHeading('Select Menus', 'Status');

    await client.selectMenus.clear();

    const files = await loadFiles('ui-elements/selectMenus');

    files.forEach(f => {
        const selectMenu: SelectMenu = require(f);

        client.selectMenus.set(selectMenu.custom_id, selectMenu);

        return table.addRow(selectMenu.custom_id, '🟩');
    });

    console.log('\n' + table.toString());

    console.log('Select Menus Loaded.');
}
