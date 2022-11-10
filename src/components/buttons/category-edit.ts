import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    MessageReaction,
    PermissionFlagsBits,
    SelectMenuBuilder,
    User
} from 'discord.js';
import { util } from '../..';
import { ButtonComponent, ComponentTypes } from '../../interfaces/MessageComponent';
import CategoryName from '../modals/category-name';
import RoleSelect from '../selectMenus/role-select';
import { RoleMessage } from '../../messages/role-select';

export const MessageComponent: ButtonComponent = {
    id: 'category-edit',
    type: ComponentTypes.Button,
    permissions: [PermissionFlagsBits.ManageRoles],

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

    async execute(interaction: ButtonInteraction, client, data: { action: 'name' | 'roles' | 'emoji' | 'delete'; category: string }) {
        if (!interaction.guild || !interaction.guildId) return;
        const guild = interaction.guild;

        const embed = new EmbedBuilder().setTitle(data.category).setColor(await util.Color.getGuildColor(guild));

        const database = await client.database.guildSettings.get(interaction.guildId);

        const category = await database.selfRoles.categories.find(c => c.name === data.category);

        if (!category) return interaction.update({ embeds: [embed.setDescription('This category no longer exists.')] });

        switch (data.action) {
            case 'name':
                return interaction.showModal(await CategoryName.build(client, 'edit', data.category));
            case 'roles':
                return interaction.update({
                    embeds: [],
                    components: [new ActionRowBuilder<SelectMenuBuilder>().addComponents([await RoleSelect.build(client, 'edit', data.category)])]
                });
            case 'emoji':
                await interaction.update({
                    embeds: [embed.setDescription('Please react to this message with the emoji you would like to use.')],
                    components: []
                });
                const message = await interaction.fetchReply();

                const filter = (_reaction: MessageReaction, user: User) => user.id === interaction.user.id;

                const collector = await message.createReactionCollector({
                    filter,
                    max: 1,
                    time: 45000
                });

                collector.on('end', async collected => {
                    if (collected.size >= 0) {
                        await interaction.editReply({
                            embeds: [embed.setDescription('You did not react with an emoji in time.')]
                        });
                    }
                });

                return collector.on('collect', async reaction => {
                    const emoji = reaction.emoji.id != null ? reaction.emoji.id : reaction.emoji.name;

                    if (!emoji) {
                        return interaction.editReply({
                            embeds: [embed.setDescription('You did not react with an emoji.')]
                        });
                    }

                    category.emoji = emoji;

                    database.selfRoles.categories.map(c => {
                        if (c.name === category.name) return category;
                        return c;
                    });

                    message.reactions.removeAll();

                    await client.database.guildSettings.update(guild.id, database);

                    await RoleMessage(client, guild);

                    return await interaction.editReply({
                        embeds: [embed.setDescription(`The emoji for this category has been updated to ${emoji}.`)],
                        components: []
                    });
                });
            case 'delete':
                database.selfRoles.categories = database.selfRoles.categories.filter(c => c !== category);

                embed.setDescription('This category has been deleted.');

                await client.database.guildSettings.update(guild.id, database);

                await RoleMessage(client, guild);

                return interaction.update({ embeds: [embed], components: [] });
        }
    }
};

export default MessageComponent;
