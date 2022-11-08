import * as discord from 'discord.js';
import { util } from '../..';
import * as MessageComponent from '../../interfaces/MessageComponent';
import { roleCategorySelect } from '../../messages/role-cateogry-select';

const button: MessageComponent.ButtonComponent = {
    id: 'role-category',
    type: MessageComponent.ComponentTypes.Button,
    async execute(interaction: discord.ButtonInteraction, client, data: { action: 'view' | 'edit' | 'create' }) {
        if (!interaction.guild || !interaction.guildId) return;
        let replyOptions;

        switch (data.action) {
            case 'view':
                replyOptions = await roleCategorySelect.build(client, interaction.guild, 'view');
                break;
            case 'edit':
                replyOptions = await roleCategorySelect.build(client, interaction.guild, 'edit');
                break;
            case 'create':
                const guildSettings = await client.database.guildSettings.get(interaction.guildId);
                if (guildSettings.selfRoles && guildSettings.selfRoles.categories && guildSettings.selfRoles.categories.length > 25) {
                    interaction.update({
                        content: null,
                        embeds: [
                            new discord.EmbedBuilder()
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
                    new discord.ModalBuilder()
                        .setCustomId('role-category-create-modal')
                        .setTitle(`What would you like to name this category?`)
                        .addComponents([
                            new discord.ActionRowBuilder<discord.TextInputBuilder>().addComponents([
                                new discord.TextInputBuilder()
                                    .setCustomId('category-name-input')
                                    .setPlaceholder('Category Name')
                                    .setMinLength(1)
                                    .setMaxLength(100)
                                    .setStyle(discord.TextInputStyle.Short)
                                    .setLabel('Category Name')
                            ])
                        ])
                );
        }

        interaction.update(replyOptions);
    }
};

module.exports = button;
