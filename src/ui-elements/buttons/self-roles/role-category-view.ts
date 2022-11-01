import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, SelectMenuBuilder } from 'discord.js';
import { Button } from '../../../interfaces/button';
import { Client } from '../../../interfaces/Client';

const button: Button = {
    custom_id: 'role-category-view',
    async execute(interaction: ButtonInteraction, client: Client) {
        console.log('role-category-view button pressed');
        if (!interaction.guild || !interaction.guildId) return;

        console.log('interaction.guild and interaction.guildId are not null');
        const guildSettings = await client.database.guildSettings.get(interaction.guildId);

        console.log(`guildSettings: ${guildSettings}`);
        const categories = guildSettings?.selfRoles?.categories;

        console.log(`categories: ${categories}`);
        const iconUrl = interaction.guild.iconURL({ size: 2048, extension: 'png' });
        const color = client.util.color;

        console.log(`iconUrl: ${iconUrl}`);

        if (!categories || categories.length === 0) {
            try {
                const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
                    new ButtonBuilder().setCustomId('role-category-back').setLabel('Back').setStyle(ButtonStyle.Secondary).setEmoji('⬅️'),
                    new ButtonBuilder().setCustomId('role-category-create').setLabel('Create a Category').setStyle(ButtonStyle.Success).setEmoji('➕')
                ]);

                const embed = new EmbedBuilder()
                    .setColor(color.hexToRGB(iconUrl != null ? await color.getAverageColor(iconUrl) : color.colorToHex('Aqua')))
                    .setTitle(`${interaction.guild.name}'s Self Roles`)
                    .setDescription(`There are no categories to view.`);

                return interaction.update({
                    embeds: [embed],
                    components: [row]
                });
            } catch (error) {
                console.log(error);
                return interaction.update({ content: 'An error occurred while trying to view the categories.' });
            }
        } else {
            if (interaction.guild == null) return;

            // Put category names in an array

            // Create a single-select menu with the category names and emojis
            const menu = new SelectMenuBuilder()
                .setCustomId('role-category-select-view')
                .setPlaceholder('Select a category')
                .addOptions(
                    categories.map(category => {
                        return {
                            label: category.name,
                            value: category.name,
                            emoji: category.emoji || '➖'
                        };
                    })
                );

            // create a new row
            const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents([menu]);

            // Create a new row
            const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents([
                new ButtonBuilder().setCustomId('role-category-back').setLabel('Back').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
            ]);

            // Update the interaction
            return interaction.update({
                components: [row, row2],
                embeds: []
            });
        }
    }
};

module.exports = button;
