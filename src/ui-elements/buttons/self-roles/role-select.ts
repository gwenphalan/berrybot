import { ActionRowBuilder, ButtonInteraction, EmbedBuilder, Role, SelectMenuBuilder, SelectMenuComponentOptionData } from 'discord.js';
import { Button } from '../../../interfaces/button';
import { Client } from '../../../interfaces/Client';

const button: Button = {
    custom_id: 'role-select',
    async execute(interaction: ButtonInteraction, client: Client, label: string | undefined) {
        if (!interaction.guild || !interaction.guildId) return;

        // Get the category from the database
        const database = await client.database.guildSettings.get(interaction.guildId);

        if (!database.selfRoles || !database.selfRoles.categories) return;

        // Get the selected category
        const selectedCategory = label;

        console.log(selectedCategory);

        // Get the category from the database
        const category = database.selfRoles.categories.find(cat => cat.name === selectedCategory);

        // If the category is null, return an error message
        if (!category) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('That category does not exist. Please contact a server administrator.')
                        .setColor(client.util.color.colorToHex('Red'))
                ],
                ephemeral: true
            });
        }

        // Put the roles into an array
        const roleIds = category.roles;

        // Create an ActionRow with a SelectMenu that contains the roles. The SelectMenu will have a custom_id of 'role-select-category'
        const selectMenu = new SelectMenuBuilder().setCustomId(`role-select["${label}"]`).setPlaceholder(`Select your roles`).setMinValues(0);

        const member = await interaction.guild.members.fetch(interaction.user.id);

        // Get all the guildRoles from the guild using the role IDs and add them to the SelectMenu, set the maxValue to the number of roles added, if the role doesnt exist, remove it from the database
        let roles: Role[] = [];
        roleIds.forEach(roleId => {
            const role = interaction.guild?.roles.cache.get(roleId);
            if (role) {
                roles.push(role);
            } else {
                // Remove the role from the database
                database.selfRoles?.categories.find(cat => cat.name === selectedCategory)?.roles.splice(roleIds.indexOf(roleId), 1);
            }
        });

        // Save the database
        await client.database.guildSettings.update(interaction.guildId, database);

        // If there are no roles, return an error message
        if (roles.length === 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('There are no roles in this category. Please contact a server administrator.')
                        .setColor(client.util.color.colorToHex('Red'))
                ],
                ephemeral: true
            });
        }

        const roleOptions: SelectMenuComponentOptionData[] = roles.map(role => ({
            label: role.name,
            value: role.id,
            default: member.roles.cache.has(role.id)
        }));
        selectMenu.addOptions(roleOptions).setMaxValues(roleOptions.length);

        // Create an ActionRow with the SelectMenu
        const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(selectMenu);

        // Send a new ephemeral reply with the ActionRow
        return interaction.reply({
            components: [row],
            ephemeral: true
        });
    }
};

module.exports = button;
