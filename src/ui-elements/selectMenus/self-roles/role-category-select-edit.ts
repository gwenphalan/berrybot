// Test Multi Select Menu

import { APISelectMenuOption, EmbedBuilder, SelectMenuInteraction } from 'discord.js';
import { Client } from '../../../interfaces/Client';
import { SelectMenu } from '../../../interfaces/selectMenu';
import { roleCategoryEditMessage } from '../../../util/embeds';

const selectMenu: SelectMenu = {
    custom_id: 'role-category-select-edit',
    async execute(interaction: SelectMenuInteraction, selected: APISelectMenuOption, client: Client) {
        if (!interaction.guild) return;

        const selectedCategory = selected.value;
        console.log(`Selected category: ${selectedCategory}`);

        // Get the category from the database
        const database = await client.database.guildSettings.get(interaction.guild.id);
        const category = database.selfRoles?.categories.find(cat => cat.name === selectedCategory);

        // If the category is null, return an error message
        if (category == null) {
            return interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('An error occurred while trying to edit the category.')
                        .setColor(client.util.color.colorToHex('Red'))
                ],
                components: []
            });
        }
        const interactionUpdateOptions = await roleCategoryEditMessage(client, interaction.guild, category);

        return interaction.update(interactionUpdateOptions);
    }
};

module.exports = selectMenu;
