// Test Single Select Menu

import { APISelectMenuOption, SelectMenuInteraction } from 'discord.js';
import { SelectMenu } from '../../../interfaces/selectMenu';

const selectMenu: SelectMenu = {
    custom_id: 'test-select',
    execute(interaction: SelectMenuInteraction, selected: APISelectMenuOption) {
        // Reply to the interaction with the selected option's label
        interaction.reply({ content: `You selected ${selected.label}`, ephemeral: true });
    }
};

module.exports = selectMenu;
