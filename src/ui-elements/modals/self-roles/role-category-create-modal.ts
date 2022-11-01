// test modal

import { ActionRowBuilder, Collection, ModalSubmitInteraction, SelectMenuBuilder, TextInputComponent } from 'discord.js';
import { Client } from '../../../interfaces/Client';
import { Modal } from '../../../interfaces/modal';

const modal: Modal = {
    custom_id: 'role-category-create-modal',
    async execute(interaction: ModalSubmitInteraction, fields: Collection<string, TextInputComponent>, _client: Client) {
        if (!interaction.guild) return;

        const modalResponse = fields.get('category-name-input')?.value;

        if (!modalResponse) return interaction.reply({ content: 'You must provide a category name!', ephemeral: true });

        // Put a list of guild roles into a Collection<roleID, roleName>(), and then filter out any bot roles, or roles above the bot's highest role, or @everyone
        const guildRoles = new Collection<string, string>();
        interaction.guild.roles.cache.forEach(role => {
            if (role.managed || !role.editable || role.name === '@everyone') return;
            guildRoles.set(role.id, role.name);
        });

        // If there are no roles that the bot can add to the category, tell the user and return
        if (!guildRoles.size) return interaction.reply({ content: 'There are no roles that I can add to this category!', ephemeral: true });

        // Create an action row with a select menu
        const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents([
            new SelectMenuBuilder()
                .setCustomId(`category-roles-select["${modalResponse}"]`)
                // Set the placeholder to the number of roles in the guild or 25, whichever is lower
                .setPlaceholder(`Select up to ${guildRoles.size < 25 ? guildRoles.size : 25} roles`)
                .setMinValues(1)
                // Set max values to 25, or the number of roles in the guild, whichever is lower
                .setMaxValues(guildRoles.size > 25 ? 25 : guildRoles.size)
                .addOptions(
                    guildRoles.map((roleName, roleID) => {
                        return {
                            label: roleName,
                            description: `Add ${roleName} to the ${modalResponse} category`,
                            value: roleID
                        };
                    })
                )
        ]);

        try {
            return interaction.reply({
                embeds: [],
                components: [row],
                ephemeral: true
            });
        } catch (error) {
            console.log(error);
            return interaction.reply({
                embeds: [],
                content: 'There was an error creating the category. Please try again.',
                components: [],
                ephemeral: true
            });
        }
    }
};

module.exports = modal;
