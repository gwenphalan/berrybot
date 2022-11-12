import { ActionRowBuilder, ButtonBuilder, ModalBuilder, PermissionFlagsBits, SelectMenuBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ModalComponent, ComponentTypes } from '../../interfaces/MessageComponent';
import { RoleMessage } from '../../messages/role-select';
import RoleSelect from '../selectMenus/role-select';
import BackButton from '../buttons/roles-back';
import { RoleCategory } from '../../messages/role-category';

export const MessageComponent: ModalComponent = {
    id: 'category-name',
    type: ComponentTypes.Modal,
    permissions: [PermissionFlagsBits.ManageRoles],

    async build(client, category?: string) {
        const data = category
            ? {
                  category: category
              }
            : undefined;

        const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder().setCustomId('name').setPlaceholder('Category Name').setStyle(TextInputStyle.Short).setLabel('Category Name')
        );

        const modal = new ModalBuilder().setCustomId(client.getCustomID(this.id, data)).setComponents([row]);

        category ? modal.setTitle(`Rename ${category}`) : modal.setTitle('What would you like to name this category?');

        return modal;
    },

    async execute(interaction, client, response, data?: { category: string }) {
        const message = interaction.message;
        if (!interaction.guild || !message) return;

        const name = response.get('name')?.value;

        if (!name) return interaction.reply({ content: 'You must provide a name for the category.', ephemeral: true });
        const database = await client.database.guildSettings.get(interaction.guild.id);

        if (data) {
            if (!database.selfRoles.categories?.find(c => c.name === data.category))
                return interaction.reply({ content: 'This category does not exist.', ephemeral: true });

            database.selfRoles.categories = database.selfRoles.categories.map(c => {
                if (c.name === data.category) c.name = name;
                return c;
            });

            await client.database.guildSettings.update(interaction.guild.id, database);

            await RoleMessage(client, interaction.guild);

            interaction.deferUpdate();
            return message.edit(await RoleCategory.build(client, interaction.guild, 'edit', name));
        }

        if (database.selfRoles.categories.find(c => c.name === name))
            return interaction.reply({ content: 'A category with that name already exists!', ephemeral: true });

        const rows = [
            new ActionRowBuilder<SelectMenuBuilder>().addComponents([await RoleSelect.build(client, interaction.guild, 'create', name)]),
            new ActionRowBuilder<ButtonBuilder>().addComponents([await BackButton.build(client)])
        ];

        interaction.deferUpdate();
        return message.edit({ components: rows, embeds: [] });
    }
};

export default MessageComponent;
