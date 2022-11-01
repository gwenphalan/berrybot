import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection, EmbedBuilder, ModalSubmitInteraction, TextInputComponent } from 'discord.js';
import { Client } from '../../../interfaces/Client';
import { Modal } from '../../../interfaces/modal';
import { updateRoleMessage } from '../../../util/selfRoles';

const modal: Modal = {
    custom_id: 'role-category-edit-name',
    async execute(interaction: ModalSubmitInteraction, fields: Collection<string, TextInputComponent>, client: Client, label?: string) {
        // Get the category name from the modal message {Editing Category Name}
        const categoryName = label;

        if (!categoryName || !interaction.guildId || !interaction.guild) return;

        const database = await client.database.guildSettings.get(interaction.guildId);

        // Return if selfRoles doesnt exist
        if (!database.selfRoles || !database.selfRoles.categories || !database.selfRoles.categories?.find(category => category.name === categoryName)) return;

        // Put the new category name in a variable
        const newCategoryName = fields.get('role-category-edit-name')?.value;

        // if newCategoryName is undefined or the same as the old category name, return
        if (!newCategoryName || newCategoryName === categoryName) return;

        // Update database with the new category name
        const category = database.selfRoles.categories.find(category => category.name === categoryName);

        if (!category) return;

        category.name = newCategoryName;

        // update database.selfRoles.categories with the new category name
        database.selfRoles.categories = database.selfRoles.categories.map(category => {
            if (category.name === categoryName) {
                category.name = newCategoryName;
            }
            return category;
        });

        // Update the database
        await client.database.guildSettings.update(interaction.guildId, database);

        const backRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('role-category-back').setLabel('Back').setStyle(ButtonStyle.Primary).setEmoji('⬅️')
        );

        interaction.message?.delete();

        updateRoleMessage(client, interaction.guild);

        // Update the message
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Editing ${newCategoryName} - Name`)
                    // Successfully updated oldCategoryName to newCategoryName
                    .setDescription(`Successfully updated ${categoryName} to ${newCategoryName}`)
                    .setColor(await client.util.color.getGuildColor(interaction.guild))
            ],
            components: [backRow]
        });
    }
};

module.exports = modal;
