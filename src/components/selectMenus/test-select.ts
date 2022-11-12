// Test Single Select Menu

import { SelectMenuBuilder } from 'discord.js';
import { ComponentTypes, SelectMenuComponent } from '../../interfaces/MessageComponent';

export const MessageComponent: SelectMenuComponent = {
    id: 'test-select',
    type: ComponentTypes.SelectMenu,

    async build(_client) {
        return new SelectMenuBuilder()
            .setCustomId('test-select')
            .setPlaceholder('Test Select')
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
                {
                    label: 'Test Option 1',
                    value: 'test-option-1'
                },
                {
                    label: 'Test Option 2',
                    value: 'test-option-2'
                },
                {
                    label: 'Test Option 3',
                    value: 'test-option-3'
                }
            ]);
    },

    execute(interaction, _client, selected) {
        // Reply to the interaction with the selected option's label
        interaction.reply({ content: `You selected ${selected.label}`, ephemeral: true });
    }
};

export default MessageComponent;
