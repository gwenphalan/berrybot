// Test Multi Select Menu

import { ActionRowBuilder, APISelectMenuOption, ButtonBuilder, ButtonStyle, EmbedBuilder, SelectMenuInteraction } from 'discord.js';
import { Client } from '../../../interfaces/Client';
import { SelectMenu } from '../../../interfaces/selectMenu';

const selectMenu: SelectMenu = {
    custom_id: 'role-category-select-view',
    async execute(interaction: SelectMenuInteraction, selected: APISelectMenuOption, client: Client) {
        if (!interaction.guild) return;

        const selectedCategory = selected.value;
        console.log(`Selected category: ${selectedCategory}`);

        // Get the category from the database
        const database = await client.database.guildSettings.get(interaction.guild.id);
        const category = database.selfRoles?.categories.find(cat => cat.name === selectedCategory);

        console.log(`Category: ${category}`);
        // If the category doesn't exist, return
        if (!category) {
            console.log(`Category doesn't exist`);
            return interaction.reply({ content: "That category doesn't exist!", ephemeral: true });
        }

        const iconUrl = interaction.guild.iconURL({ size: 256, extension: 'png' });
        const color = client.util.color;
        const embedColor = color.hexToRGB(iconUrl != null ? await color.getAverageColor(iconUrl) : color.colorToHex('Aqua'));

        console.log(`Embed color: ${embedColor}`);

        // For each role in the category, if it does not exist in the guild, remove it from the database. If there were any roles removed, update the database.
        let rolesRemoved = false;
        for (let i = 0; i < category.roles.length; i++) {
            const roleId = category.roles[i];
            const role = interaction.guild.roles.cache.get(roleId);
            if (!role) {
                // If the non-existent role is the only role in the category, set the category roles to an empty array, otherwise remove the role from the array
                if (category.roles.length === 1) {
                    category.roles = [];
                } else {
                    category.roles.splice(i, 1);
                }

                rolesRemoved = true;
            }
        }
        if (rolesRemoved) {
            await client.database.guildSettings.update(interaction.guild.id, database);
        }

        // Create the embed
        const embed = new EmbedBuilder()
            .setTitle(`${category.name} Role Category`)
            .setFields([
                {
                    name: 'Name',
                    value: category.name,
                    inline: true
                },
                {
                    name: 'Emoji',
                    value: category.emoji || 'None',
                    inline: true
                },
                {
                    name: 'Roles',
                    value: category.roles?.length > 0 ? category.roles.map(role => `<@&${role}>`).join(', ') : 'None'
                }
            ])
            .setColor(embedColor);

        // Create a row with a back button
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder().setCustomId('role-category-back').setLabel('Back').setStyle(ButtonStyle.Secondary).setEmoji('⬅️'),
            new ButtonBuilder().setCustomId(`role-category-edit["${category.name}"]`).setLabel(`Edit`).setStyle(ButtonStyle.Secondary).setEmoji('✏️')
        ]);

        // Send the embed
        interaction.update({ embeds: [embed], components: [row] });

        return console.log(`Successfully sent the embed`);
    }
};

module.exports = selectMenu;
