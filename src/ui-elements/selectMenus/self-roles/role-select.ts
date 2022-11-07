import { APISelectMenuOption, EmbedBuilder, PermissionFlagsBits, SelectMenuInteraction } from 'discord.js';
import { Client } from '../../../interfaces/Client';
import { SelectMenu } from '../../../interfaces/selectMenu';

const selectMenu: SelectMenu = {
    custom_id: 'role-select',
    multi_select: true,
    async execute(interaction: SelectMenuInteraction, selected: APISelectMenuOption[], client: Client) {
        if (!interaction.guild || !interaction.guildId) return;

        // Get the category from the database
        const database = await client.database.guildSettings.get(interaction.guildId);

        // If the bot does not have PermissionsFlagBits.ManageRoles, return an error message
        if (!interaction.guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('I do not have the `Manage Roles` permission. Please contact a server administrator.')
                        .setColor(client.util.color.colorToHex('Red'))
                ],
                components: []
            });
        }

        if (!database.selfRoles || !database.selfRoles.categories) return;

        // For each selected role id (selected value), get the role from the guild and add it to an array
        const selectedRoles = interaction.guild.roles.cache.filter(role => selected.map(sel => sel.value).includes(role.id));

        const roleOptions = interaction.guild.roles.cache.filter(role => interaction.component.options.map(opt => opt.value).includes(role.id));

        // Get the category from the database that contains all the roleIds in interaction.component.options
        const category = database.selfRoles.categories.find(cat => cat.roles.every(role => roleOptions.map(opt => opt.id).includes(role)));

        const member = await interaction.guild.members.fetch(interaction.user.id);

        let addedRoles: string[] = [];
        let removedRoles: string[] = [];

        const memberRoles = member.roles.cache;

        // For each role in roleOptions, if the role is not in selectedRoles, remove it from the member, otherwise add it
        memberRoles.forEach(role => {
            if (!selectedRoles.has(role.id)) {
                member.roles.remove(role);
                removedRoles.push(role.toString());
            } else if (!member.roles.cache.has(role.id)) {
                member.roles.add(role);
                addedRoles.push(role.toString());
            }
        });

        // Reply to the interaction with an embed containing the fields with a list of roles added and removed to the member, with bullet points
        return interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Roles Updated - ${category?.name}`)
                    .addFields(
                        {
                            name: 'Added',
                            value: addedRoles.length > 0 ? addedRoles.join('\n') : 'None'
                        },
                        {
                            name: 'Removed',
                            value: removedRoles.length > 0 ? removedRoles.join('\n') : 'None'
                        }
                    )
                    .setColor(await client.util.color.getGuildColor(interaction.guild))
            ],
            components: []
        });
    }
};

module.exports = selectMenu;
