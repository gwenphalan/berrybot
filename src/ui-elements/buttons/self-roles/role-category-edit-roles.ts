import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Collection, EmbedBuilder, SelectMenuBuilder } from 'discord.js';
import { Button } from '../../../interfaces/button';
import { Client } from '../../../interfaces/Client';

const button: Button = {
    custom_id: 'role-category-edit-roles',
    async execute(interaction: ButtonInteraction, client: Client, label?: string) {
        // Return if no guild
        if (!interaction.guild || !interaction.guildId) return;

        // Get the Category Name from the embed in the interaction.message
        const categoryName = label;

        // Return if no category name
        if (!categoryName) return;

        // Get the category from the database
        const guildSettings = await client.database.guildSettings.get(interaction.guildId);
        const category = guildSettings.selfRoles?.categories?.find(category => category.name === categoryName);

        const iconUrl = interaction.guild.iconURL({ size: 256, extension: 'png' });
        const embedColor = client.util.color.hexToRGB(
            iconUrl != null ? await client.util.color.getAverageColor(iconUrl) : client.util.color.colorToHex('Aqua')
        );

        const embed = new EmbedBuilder().setTitle(`Editing ${categoryName} - Roles`).setColor(embedColor);

        // Return if no category and update the message
        if (!category) {
            interaction.update({
                content: null,
                embeds: [embed.setDescription('This category does not exist!')],
                components: []
            });
            return;
        }

        // Put a list of guild roles into a Collection<roleID, roleName>(), and then filter out any bot roles, or roles above the bot's highest role, or @everyone
        const guildRoles = new Collection<string, string>();
        interaction.guild.roles.cache.forEach(role => {
            if (role.managed || !role.editable || role.name === '@everyone') return;
            guildRoles.set(role.id, role.name);
        });

        // If there are no roles that the bot can add to the category, tell the user and return
        if (!guildRoles.size) return interaction.update({ content: 'There are no roles that I can add to this category!' });

        // Create an action row with a select menu
        const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents([
            new SelectMenuBuilder()
                .setCustomId(`category-roles-select["${categoryName}"]`)
                // Set the placeholder to the number of roles in the guild or 25, whichever is lower
                .setPlaceholder(`Select up to ${guildRoles.size < 25 ? guildRoles.size : 25} roles`)
                .setMinValues(1)
                // Set max values to 25, or the number of roles in the guild, whichever is lower
                .setMaxValues(guildRoles.size > 25 ? 25 : guildRoles.size)
                .addOptions(
                    guildRoles.map((roleName, roleID) => {
                        return {
                            label: roleName,
                            description: `Add ${roleName} to the ${categoryName} category`,
                            value: roleID,
                            default: category.roles.includes(roleID)
                        };
                    })
                )
        ]);
        // Create an ActionRow with a back button
        const backRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('role-category-back').setLabel('Back').setStyle(ButtonStyle.Primary).setEmoji('⬅️')
        );

        // Send the message
        return interaction.update({ embeds: [], components: [row, backRow] });
    }
};

module.exports = button;
