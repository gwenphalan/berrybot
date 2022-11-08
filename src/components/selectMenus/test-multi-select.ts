// Test Multi Select Menu

import { ComponentTypes, SelectMenuComponent } from '../../interfaces/MessageComponent';

const selectMenu: SelectMenuComponent = {
    id: 'test-multi-select',
    type: ComponentTypes.SelectMenu,
    multi_select: true,
    execute(interaction, _client, selected) {
        // Reply to the interaction with the selected option's label
        interaction.reply({ content: `You selected ${selected.map(option => option.label).join(', ')}`, ephemeral: true });
    }
};

module.exports = selectMenu;
