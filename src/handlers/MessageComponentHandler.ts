import type { Client } from '../interfaces';
import { BaseMessageComponent } from '../interfaces/MessageComponent';
import { Files } from '../util';

export const loadComponents = async (client: Client) => {
    const ascii = require('ascii-table');
    const table = new ascii().setHeading('Type', 'Name', 'Status');

    await client.messageComponents.clear();

    const types = ['button', 'selectMenu', 'modal'];

    for (let i = 0; i < types.length; i++) {
        const components = await Files.load(`components/${types[i]}s`);

        for (const c of components) {
            const componentName = c.split('/')[c.split('/').length - 1].split('.')[0];
            try {
                const component: BaseMessageComponent = require(c).MessageComponent;

                const name = component.id;

                client.messageComponents.set(name, component);

                table.addRow(types[i], name, '🟩');
            } catch (error) {
                console.log(`Error loading component ${componentName}: ${error}`);
                table.addRow(types[i], componentName, '🟥');
            }
        }
    }

    console.log('\n' + table.toString());

    console.log('Message Components Loaded');
};
