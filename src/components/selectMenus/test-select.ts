// Test Single Select Menu

import { ComponentTypes, SelectMenuComponent } from '../../interfaces/MessageComponent';

const selectMenu: SelectMenuComponent = {
    id: 'test-select',
    type: ComponentTypes.SelectMenu,
    execute(interaction, _client, selected) {
        // Reply to the interaction with the selected option's label
        interaction.reply({ content: `You selected ${selected.label}`, ephemeral: true });
    }
};

module.exports = selectMenu;
