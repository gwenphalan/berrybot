import { ButtonBuilder, ButtonInteraction, ButtonStyle } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '../../interfaces/MessageComponent';

export const MessageComponent: ButtonComponent = {
    id: 'category-edit',
    type: ComponentTypes.Button,

    async build(client, action: 'name' | 'roles' | 'emoji' | 'delete', category: string) {
        const data = {
            action: action,
            category: category
        };

        const button = new ButtonBuilder().setCustomId(client.getCustomID(this.id, data));

        switch (action) {
            case 'name':
                button.setLabel('Name').setStyle(ButtonStyle.Secondary).setEmoji('✏️');
                break;
            case 'roles':
                button.setLabel('Roles').setStyle(ButtonStyle.Secondary).setEmoji('🎨');
                break;
            case 'emoji':
                button.setLabel('Emoji').setStyle(ButtonStyle.Secondary).setEmoji('📜');
                break;
            case 'delete':
                button.setLabel('Delete').setStyle(ButtonStyle.Danger).setEmoji('🗑️');
                break;
        }

        return button;
    },

    async execute(interaction: ButtonInteraction, _client, _data: { action: 'name' | 'roles' | 'emoji' | 'delete'; category: string }) {
        return interaction.update({ content: 'This feature is currently disabled.', components: [] });
    }
};

export default MessageComponent;
