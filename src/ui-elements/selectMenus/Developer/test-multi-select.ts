// Test Multi Select Menu

import { APISelectMenuOption, SelectMenuInteraction } from 'discord.js';
import { SelectMenu } from '../../../interfaces/selectMenu';

const selectMenu: SelectMenu = {
    custom_id: 'test-multi-select',
    multi_select: true,
    execute(interaction: SelectMenuInteraction, selected: APISelectMenuOption[]) {
        // Reply to the interaction with the selected option's label
        interaction.reply({ content: `You selected ${selected.map(option => option.label).join(', ')}`, ephemeral: true });
    }
};

module.exports = selectMenu;
