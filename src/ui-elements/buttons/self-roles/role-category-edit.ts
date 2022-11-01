import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, SelectMenuBuilder } from 'discord.js';
import { Button } from '../../../interfaces/button';
import { Client } from '../../../interfaces/Client';
import { roleCategoryEditMessage } from '../../../util/embeds';

const button: Button = {
    custom_id: 'role-category-edit',
    async execute(interaction: ButtonInteraction, _client: Client, label?: string) {
        // Check if the interaction is in a guild
        if (!interaction.guild || !interaction.guildId) return;

        // get the interaction.component
        const component = interaction.component;
        console.log(`interaction.component: ${component}`);

        const categoryName = label;

        console.log(`categoryName: ${categoryName}`);
        const iconURL = interaction.guild.iconURL({ size: 2048, extension: 'png' });
        const embedColor = _client.util.color.hexToRGB(
            iconURL != null ? await _client.util.color.getAverageColor(iconURL) : _client.util.color.colorToHex('Aqua')
        );

        console.log(`embedColor: ${embedColor}`);
        // If the category name is null, ask the user to select a category to edit
        if (categoryName == null) {
            // Get a list of category names from the database
            const categories = await (await _client.database.guildSettings.get(interaction.guildId))?.selfRoles?.categories;

            // If there are no categories, return an error message
            if (!categories || categories.length === 0) {
                // Get the category from the database
                const category = await (
                    await _client.database.guildSettings.get(interaction.guildId)
                )?.selfRoles?.categories.find(category => category.name === categoryName);

                // If the category is null, return an error message
                if (category == null || !category) {
                    // Get the category from the database
                    const category = await (
                        await _client.database.guildSettings.get(interaction.guildId)
                    )?.selfRoles?.categories.find(category => category.name === categoryName);

                    // If the category is null, return an error message
                    if (category == null || !category) {
                        const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
                            new ButtonBuilder().setCustomId('role-category-back').setLabel('Back').setStyle(ButtonStyle.Secondary).setEmoji('⬅️'),
                            new ButtonBuilder().setCustomId('role-category-create').setLabel('Create a Category').setStyle(ButtonStyle.Success).setEmoji('➕')
                        ]);

                        const embed = new EmbedBuilder()
                            .setColor(await _client.util.color.getGuildColor(interaction.guild))
                            .setTitle(`${interaction.guild.name}'s Self Roles`)
                            .setDescription(`There are no categories to view.`);

                        return interaction.update({
                            embeds: [embed],
                            components: [row]
                        });
                    }

                    return interaction.update(await roleCategoryEditMessage(_client, interaction.guild, category));
                }

                return interaction.update(await roleCategoryEditMessage(_client, interaction.guild, category));
            }

            console.log(`categories: ${categories}`);
            // Create an ActionRow with a SelectMenu that contains the categories. The SelectMenu will have a custom_id of 'role-category-select-edit'
            const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
                new SelectMenuBuilder()
                    .setCustomId('role-category-select-edit')
                    .setPlaceholder('Select a category')
                    .addOptions(
                        categories.map(category => {
                            return {
                                label: category.name,
                                value: category.name,
                                emoji: category.emoji || '➖'
                            };
                        })
                    )
            );

            const backRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
                new ButtonBuilder().setCustomId('role-category-back').setLabel('Back').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
            ]);

            console.log(`row: ${row}`);
            return interaction.update({
                content: null,
                embeds: [],
                components: [row, backRow]
            });
        }
        // If the category name is not null, send an embed with the category information, and 4 buttons: Edit Name, Edit Emoji, Edit Roles, and Back
        else {
            // Get the category from the database
            const category = await (
                await _client.database.guildSettings.get(interaction.guildId)
            )?.selfRoles?.categories.find(category => category.name === categoryName);

            // If the category is null, return an error message
            if (category == null || !category) {
                return interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription('An error occurred while trying to edit the category.')
                            .setColor(_client.util.color.colorToHex('Red'))
                    ],
                    components: []
                });
            }

            return interaction.update(await roleCategoryEditMessage(_client, interaction.guild, category));
        }
    }
};

module.exports = button;
