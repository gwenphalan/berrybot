import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, MessageReaction, User } from 'discord.js';
import { Button } from '../../../interfaces/button';
import { Client } from '../../../interfaces/Client';
import { updateRoleMessage } from '../../../util/selfRoles';

const button: Button = {
    custom_id: 'role-category-edit-emoji',
    async execute(interaction: ButtonInteraction, client: Client, label?: string) {
        // Return if no guild
        if (!interaction.guild || !interaction.guildId || !interaction.channel) return;

        const categoryName = label;

        // Return if no category name
        if (!categoryName) return;

        // Get the category from the database
        const guildSettings = await client.database.guildSettings.get(interaction.guildId);

        // Return if SelfRoles or Categories are undefined
        if (!guildSettings.selfRoles || !guildSettings.selfRoles.categories) return;

        const category = guildSettings.selfRoles.categories.find(category => category.name === categoryName);

        const iconUrl = interaction.guild.iconURL({ size: 256, extension: 'png' });
        const embedColor = client.util.color.hexToRGB(
            iconUrl != null ? await client.util.color.getAverageColor(iconUrl) : client.util.color.colorToHex('Aqua')
        );

        const embed = new EmbedBuilder().setTitle(`Editing ${categoryName} - Emoji`).setColor(embedColor);

        // Return if no category and update the message
        if (!category) {
            interaction.update({
                content: null,
                embeds: [embed.setDescription('This category does not exist!')],
                components: []
            });
            return;
        }

        const backRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
            // Back Button
            new ButtonBuilder().setCustomId('role-category-back').setLabel('Back').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
        ]);

        // TODO: Add emoji selection

        await interaction.update({
            embeds: [embed.setDescription('Please react to this message with the emoji you would like to use.')],
            components: []
        });
        const message = await interaction.fetchReply();

        console.log(`Waiting for reaction from ${interaction.user.tag} [${interaction.user.id}] in ${interaction.guild.name}...`);
        //  Await for a reaction by the interaction user for 15 seconds
        const filter = (_reaction: MessageReaction, _user: User) => {
            return true;
        };
        const collecter = await message.createReactionCollector({ filter, max: 1, time: 15000 });

        collecter.on('collect', async (reaction: MessageReaction) => {
            if (!guildSettings.selfRoles || !guildSettings.selfRoles.categories) return;

            // Update the category in the database to the emoji ID if it is a custom emoji, or the emoji name if it is a unicode emoji
            const emoji = reaction.emoji.id != null ? reaction.emoji.id : reaction.emoji.name;

            if (!emoji) {
                return interaction.editReply({
                    embeds: [embed.setDescription('You did not react with an emoji.')],
                    components: [backRow]
                });
            }

            if (!interaction.guildId) return;

            // Update the category with the emoji
            guildSettings.selfRoles.categories.find(category => category.name === categoryName)!.emoji = emoji;
            await client.database.guildSettings.update(interaction.guildId, guildSettings);

            // Clear all reactions on the message
            message.reactions.removeAll();

            await guildSettings.save();
            if (interaction.guild) updateRoleMessage(client, interaction.guild);
            // Update the message telling the user that the edit was successful, what the chosen emoji was, and add a back button.
            return await interaction.editReply({
                embeds: [embed.setDescription(`Successfully set the emoji to ${emoji}`)],
                components: [backRow]
            });
        });

        collecter.on('end', async collected => {
            if (collected.size === 0) {
                await interaction.editReply({
                    embeds: [embed.setDescription('You did not react with an emoji.')],
                    components: [backRow]
                });
            }
        });

        return;
    }
};

module.exports = button;
