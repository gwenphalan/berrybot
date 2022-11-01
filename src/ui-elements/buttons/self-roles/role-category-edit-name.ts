import { ActionRowBuilder, ButtonInteraction, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Button } from '../../../interfaces/button';
import { Client } from '../../../interfaces/Client';

const button: Button = {
    custom_id: 'role-category-edit-name',
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

        const embed = new EmbedBuilder().setTitle(`Editing ${categoryName} - Name`).setColor(embedColor);

        // Return if no category and update the message
        if (!category) {
            interaction.update({
                content: null,
                embeds: [embed.setDescription('This category does not exist!')],
                components: []
            });
            return;
        }
        const modal = new ModalBuilder()
            .setTitle(`Edit Category Name`)
            .setCustomId(`role-category-edit-name["${category.name}"]`)
            .addComponents([
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId('role-category-edit-name')
                        .setPlaceholder(`${categoryName}`)
                        .setMinLength(1)
                        .setMaxLength(32)
                        .setStyle(TextInputStyle.Short)
                        .setLabel('Category Name')
                )
            ]);

        return interaction.showModal(modal);
    }
};

module.exports = button;
