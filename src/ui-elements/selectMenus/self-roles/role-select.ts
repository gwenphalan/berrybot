import { APISelectMenuOption, EmbedBuilder, PermissionFlagsBits, SelectMenuComponent, SelectMenuInteraction } from 'discord.js';
import { Client } from '../../../interfaces/Client';
import { SelectMenu } from '../../../interfaces/selectMenu';

const selectMenu: SelectMenu = {
    custom_id: 'role-select',
    multi_select: true,
    async execute(interaction: SelectMenuInteraction, selected: APISelectMenuOption[], client: Client, label: string) {
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

        const roleOptions = interaction.guild.roles.cache.filter(role =>
            (interaction.component as SelectMenuComponent).options.map(opt => opt.value).includes(role.id)
        );

        const category = database.selfRoles.categories.find(cat => cat.name === label);

        if (!category) return;

        const member = await interaction.guild.members.fetch(interaction.user.id);

        let addedRoles: string[] = [];
        let removedRoles: string[] = [];

        // Put the member's roles in a constant and filter out any role that's not in the category
        let memberRoles = member.roles.cache;

        await roleOptions.forEach(async role => {
            if (!selectedRoles.has(role.id) && memberRoles.has(role.id)) {
                console.log(`Removed ${role.name}`);
                member.roles.remove(role);
                removedRoles.push(role.toString());
            } else if (selectedRoles.has(role.id) && !memberRoles.has(role.id)) {
                console.log(`Added ${role.name}`);
                member.roles.add(role);
                addedRoles.push(role.toString());
            }
        });

        const embed = new EmbedBuilder()
            .setTitle(`Roles Updated - ${category?.name}`)
            .setDescription(
                `${memberRoles
                    .filter(role => selectedRoles.has(role.id))
                    .map(role => role.toString())
                    .join(', ')}`
            )
            .setColor(await client.util.color.getGuildColor(interaction.guild));

        if (removedRoles.length > 0) {
            embed.addFields({
                name: 'Removed',
                value: ' • ' + removedRoles.join('\n • ')
            });
        } else if (addedRoles.length > 0) {
            embed.addFields({
                name: 'Added',
                value: ' • ' + addedRoles.join('\n • ')
            });
        }
        // Reply to the interaction with an embed containing the fields with a list of roles added and removed to the member, with bullet points
        return interaction.update({
            embeds: [embed],
            components: []
        });
    }
};

module.exports = selectMenu;
