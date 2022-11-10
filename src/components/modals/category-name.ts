// test modal

import { ActionRowBuilder, EmbedBuilder, ModalBuilder, PermissionFlagsBits, SelectMenuBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { util } from '../..';
import { Client } from '../../interfaces';
import { ModalComponent, ComponentTypes } from '../../interfaces/MessageComponent';
import RoleSelect from '../selectMenus/role-select';

async function build(_client: Client, action: 'create'): Promise<ModalBuilder>;
async function build(_client: Client, action: 'edit', category: string): Promise<ModalBuilder>;
async function build(_client: Client, action: 'create' | 'edit', category?: string) {
    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder().setCustomId('name').setPlaceholder('Category Name').setStyle(TextInputStyle.Short).setLabel('Category Name')
    );
    const modal = new ModalBuilder().setTitle('What would you like to name this category?').setCustomId('category-name').setComponents([row]);

    if (action === 'edit') modal.setTitle(`Rename ${category}`).setCustomId(`category-name["category":"${category}"`);

    return modal;
}

export const MessageComponent: ModalComponent = {
    id: 'category-name',
    type: ComponentTypes.Modal,
    permissions: [PermissionFlagsBits.ManageRoles],

    build: build,

    async execute(interaction, client, response, data?: { category: string }) {
        if (!interaction.guild) return;

        const name = response.get('name')?.value;

        if (!name) return interaction.reply({ content: 'You must provide a name for the category.', ephemeral: true });
        const database = await client.database.guildSettings.get(interaction.guild.id);

        if (data) {
            if (!database || !database.selfRoles || !database.selfRoles.categories?.find(c => c.name === data.category))
                return interaction.reply({ content: 'This category does not exist.', ephemeral: true });

            database.selfRoles.categories = database.selfRoles.categories.map(c => {
                if (c.name === data.category) c.name = name;
                return c;
            });

            await client.database.guildSettings.update(interaction.guild.id, database);

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Category Name Changed')
                        .setDescription(`The category name has been changed from \`${data.category}\` to \`${name}\``)
                        .setColor(await util.Color.getGuildColor(interaction.guild))
                ]
            });
        }

        if (database.selfRoles && database.selfRoles.categories?.find(c => c.name === name))
            return interaction.reply({ content: 'A category with that name already exists!', ephemeral: true });

        const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents([await RoleSelect.build(client, interaction.guild, 'create', name)]);

        return interaction.reply({ components: [row] });
    }
};

export default MessageComponent;
