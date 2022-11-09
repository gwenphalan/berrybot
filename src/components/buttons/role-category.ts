import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { util } from '../..';
import { ButtonComponent, ComponentTypes } from '../../interfaces/MessageComponent';
import { roleCategorySelect } from '../../messages/role-cateogry-select';
import { RoleCategory } from '../../messages/role-category';

export const MessageComponent: ButtonComponent = {
    id: 'role-category',
    type: ComponentTypes.Button,

    async build(_client, action: 'view' | 'edit' | 'create', category?: string) {
        const data = {
            action: action,
            category: category
        };

        const button = new ButtonBuilder().setCustomId(_client.getCustomID('role-category', data));

        switch (action) {
            case 'view':
                button.setLabel('View').setStyle(ButtonStyle.Secondary).setEmoji('🔍');
                break;
            case 'edit':
                button.setLabel('Edit').setStyle(ButtonStyle.Secondary).setEmoji('✏️');
                break;
            case 'create':
                button.setLabel('Create').setStyle(ButtonStyle.Success).setEmoji('➕');
                break;
        }

        return button;
    },

    async execute(interaction: ButtonInteraction, client, data: { action: 'view' | 'edit' | 'create'; category?: string }) {
        if (!interaction.guild || !interaction.guildId) return;
        let replyOptions;

        console.log(data);

        switch (data.action) {
            case 'view':
                replyOptions = await roleCategorySelect.build(client, interaction.guild, 'view');
                break;
            case 'edit':
                if (data.category) replyOptions = await RoleCategory.build(client, interaction.guild, 'edit', data.category);
                else replyOptions = await roleCategorySelect.build(client, interaction.guild, 'edit');
                break;
            case 'create':
                const guildSettings = await client.database.guildSettings.get(interaction.guildId);
                if (guildSettings.selfRoles && guildSettings.selfRoles.categories && guildSettings.selfRoles.categories.length > 25) {
                    interaction.update({
                        content: null,
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Self Roles')
                                .setDescription('You have reached the maximum amount of categories!')
                                .setColor(await util.Color.getGuildColor(interaction.guild))
                        ],
                        components: []
                    });
                    return;
                }

                interaction.deleteReply();

                return interaction.showModal(
                    new ModalBuilder()
                        .setCustomId('role-category-create-modal')
                        .setTitle(`What would you like to name this category?`)
                        .addComponents([
                            new ActionRowBuilder<TextInputBuilder>().addComponents([
                                new TextInputBuilder()
                                    .setCustomId('category-name-input')
                                    .setPlaceholder('Category Name')
                                    .setMinLength(1)
                                    .setMaxLength(100)
                                    .setStyle(TextInputStyle.Short)
                                    .setLabel('Category Name')
                            ])
                        ])
                );
        }

        interaction.update(replyOptions);
    }
};

export default MessageComponent;
