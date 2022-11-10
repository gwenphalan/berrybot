import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, PermissionFlagsBits, SelectMenuBuilder } from 'discord.js';
import { util } from '../..';
import { ButtonComponent, ComponentTypes } from '../../interfaces/MessageComponent';
import { roleCategorySelect } from '../../messages/role-cateogry-select';
import { RoleCategory } from '../../messages/role-category';
import CategoryName from '../modals/category-name';
import RoleSelect from '../selectMenus/role-select';
import ChannelSelect from '../selectMenus/channel-select';

export const MessageComponent: ButtonComponent = {
    id: 'role-category',
    type: ComponentTypes.Button,
    permissions: [PermissionFlagsBits.ManageRoles],

    async build(client, action: 'view' | 'edit' | 'create' | 'assign' | 'message', category?: string, guild?: string) {
        const data = {
            action: action,
            category: category
        };

        const button = new ButtonBuilder().setCustomId(client.getCustomID('role-category', data));

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
            case 'assign':
                const database = await client.database.guildSettings.get(guild || '');

                if (!database || !database.selfRoles || !database.selfRoles.categories?.find(c => c.name === category))
                    return button.setDisabled(true).setLabel('Deleted Category').setStyle(ButtonStyle.Primary).setEmoji('❌');

                const c = database.selfRoles.categories.find(c => c.name === category);

                if (!c || !c.roles?.length) return button.setDisabled(true).setLabel('No Roles').setStyle(ButtonStyle.Primary).setEmoji('❌');

                button.setLabel(c.name).setStyle(ButtonStyle.Secondary).setEmoji(c.emoji);
                break;
            case 'message':
                button.setLabel('Send Role Message').setStyle(ButtonStyle.Primary).setEmoji('📨');
                break;
        }

        return button;
    },

    async execute(interaction: ButtonInteraction, client, data: { action: 'view' | 'edit' | 'create' | 'assign' | 'message'; category?: string }) {
        if (!interaction.guild || !interaction.guildId) return;
        console.log(data);

        switch (data.action) {
            case 'view':
                return interaction.update(await roleCategorySelect.build(client, interaction.guild, 'view'));
                break;
            case 'edit':
                if (data.category) return interaction.update(await RoleCategory.build(client, interaction.guild, 'edit', data.category));
                else return interaction.update(await roleCategorySelect.build(client, interaction.guild, 'edit'));
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

                return interaction.showModal(await CategoryName.build(client, interaction.guild));
            case 'assign':
                if (!data.category || !interaction.member) return;

                return interaction.reply({
                    ephemeral: true,
                    components: [
                        new ActionRowBuilder<SelectMenuBuilder>().addComponents([
                            await RoleSelect.build(client, interaction.guild, 'assign', data.category, interaction.member)
                        ])
                    ]
                });

            case 'message':
                return interaction.update({
                    content: null,
                    embeds: [],
                    components: [new ActionRowBuilder<SelectMenuBuilder>().addComponents([await ChannelSelect.build(client, interaction.guild, 'message')])]
                });
        }
    }
};

export default MessageComponent;
