import { ActionRowBuilder, ButtonInteraction, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Button } from '../../../interfaces/button';
import { Client } from '../../../interfaces/Client';

const button: Button = {
    custom_id: 'role-category-create',
    async execute(interaction: ButtonInteraction, client: Client) {
        if (!interaction.guild || !interaction.guildId) return;

        // Put the guildSettings into a variable
        const guildSettings = await client.database.guildSettings.get(interaction.guildId);

        // If guildSettings.selfRoles exists, and guildSettings.selfRoles.categories exists, and categories.length is greater than 25, return and update the message
        if (guildSettings.selfRoles && guildSettings.selfRoles.categories && guildSettings.selfRoles.categories.length > 25) {
            interaction.update({
                content: null,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Self Roles')
                        .setDescription('You have reached the maximum amount of categories!')
                        .setColor(client.util.color.hexToRGB(client.util.color.colorToHex('Red')))
                ],
                components: []
            });
            return;
        }

        // Create a modal
        console.log(`Creating a modal for ${interaction.user.tag}`);
        const modal = new ModalBuilder().setCustomId('role-category-create-modal').setTitle(`What would you like to name this category?`);

        console.log(`Creating a text input for ${interaction.user.tag}`);
        const row = new ActionRowBuilder<TextInputBuilder>().addComponents([
            new TextInputBuilder()
                .setCustomId('category-name-input')
                .setPlaceholder('Category Name')
                .setMinLength(1)
                .setMaxLength(100)
                .setStyle(TextInputStyle.Short)
                .setLabel('Category Name')
        ]);

        modal.addComponents([row]);

        interaction.deleteReply();
        return interaction.showModal(modal);
    }
};

module.exports = button;
