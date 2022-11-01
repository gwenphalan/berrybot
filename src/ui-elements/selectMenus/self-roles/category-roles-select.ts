// Test Multi Select Menu

import { ActionRowBuilder, APISelectMenuOption, ButtonBuilder, ButtonStyle, EmbedBuilder, Role, SelectMenuInteraction } from 'discord.js';
import { SelfRoleCategory } from '../../../database/schemas/GuildSettings';
import { Client } from '../../../interfaces/Client';
import { SelectMenu } from '../../../interfaces/selectMenu';
import { updateRoleMessage } from '../../../util/selfRoles';

const selectMenu: SelectMenu = {
    custom_id: 'category-roles-select',
    multi_select: true,
    async execute(interaction: SelectMenuInteraction, selected: APISelectMenuOption[], client: Client, label?: string) {
        if (!interaction.guild || !interaction.guildId) return;

        console.log(`Selected roles: ${selected.map(role => role.value)}`);
        // Parse the category name from interaction.components.options[0].description (`Add RoleName to the CategoryName category`) using regex (e.g. `Add new role to the RoleCategory category` => `RoleCategory`)
        const categoryName = label;

        // if the category name is undefined, return
        if (!categoryName) return;

        console.log(`Category name: ${categoryName}`);
        // Get all selected roles from the interaction, and get them from the guild using the option value, selectedRoles: Role[]
        const selectedRoles = selected.map(option => interaction.guild?.roles.cache.get(option.value) as Role);

        // If there are no selected roles, tell the user they must select at least one role
        if (!selectedRoles.length || !selectedRoles) return interaction.reply({ content: 'You must select at least one role!', ephemeral: true });

        // Dynamic is no longer a valid option for guild.iconURL()
        const iconUrl = interaction.guild.iconURL({ size: 256, extension: 'png' });
        const embedColor = await client.util.color.hexToRGB(
            iconUrl != null ? await client.util.color.getAverageColor(iconUrl) : client.util.color.colorToHex('Aqua')
        );

        console.log(`Embed color: ${embedColor}`);
        const database = await client.database.guildSettings.get(interaction.guild.id);

        const category: SelfRoleCategory = {
            name: categoryName,
            roles: selectedRoles.map(role => role?.id),
            // If the category already exists, and it has an emoji, use that emoji, otherwise set it to undefined
            emoji: database.selfRoles?.categories?.find(category => category.name === categoryName)?.emoji
        };
        const embed = new EmbedBuilder()
            .setTitle(`Added ${selectedRoles.length} role${selectedRoles.length > 1 ? 's' : ''} to the ${categoryName} category`)
            // List all the roles that were added to the category with a bullet point
            .setDescription(`${selectedRoles.map(role => `• ${role}`).join('\n')}`)
            .setColor(embedColor);

        console.log(`Category: ${category}`);
        // If database.selfRoles doesn't exist, create it, otherwise push the category to the array, then update the database, if the category already exists, update it with the new roles
        if (!database.selfRoles) {
            database.selfRoles = {
                categories: [category]
            };
        } else {
            const categoryIndex = database.selfRoles.categories.findIndex(category => category.name === categoryName);
            if (categoryIndex === -1) {
                database.selfRoles.categories.push(category);
            } else {
                database.selfRoles.categories[categoryIndex] = category;
                // Change the embed title to "Updated Roles in the {Category Name} category"
                embed.setTitle(`Updated roles in the ${categoryName} category`);
            }
        }

        await database.save();

        console.log(`Database saved`);

        // Create a row with a 'role-category-back' button
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder().setCustomId('role-category-back').setLabel('Back').setStyle(ButtonStyle.Primary)
        ]);

        updateRoleMessage(client, interaction.guild);

        return interaction.update({ embeds: [embed], components: [row] });
    }
};

module.exports = selectMenu;
