import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../interfaces/command';
import { formatDuration, parseDuration } from '../../util/timeUtilities';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user in the server.')
        .addUserOption(option => option.setName('user').setDescription('The user to timeout.').setRequired(true))
        .addStringOption(option => option.setName('duration').setDescription('The duration of the timeout.').setRequired(false))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the timeout.').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction: ChatInputCommandInteraction) {
        // Return if the command wasn't used in a guild.
        if (!interaction.guild) return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });

        // Put the member into a variable.
        const user = interaction.options.getUser('user');
        const member = await interaction.guild?.members.fetch(user?.id as string);

        // Return if the interaction user was the same as the member and send a message.
        if (interaction.user.id == member.id) return interaction.reply({ content: "You can't timeout yourself!", ephemeral: true });

        // Put the reason into a variable.
        const reason = interaction.options.getString('reason');

        // Return if no member was found.
        if (!member) return await interaction.reply({ content: 'The user is not in the server.', ephemeral: true });

        // Parse the provided duration into milliseconds.
        const duration = parseDuration(interaction.options.getString('duration') as string);

        // Attempt to timeout the member.
        try {
            // Timeout the member and send a message.
            return member.timeout(duration === 0 ? null : duration, reason ? reason : 'No reason provided.').then(() => {
                interaction.reply({ content: `Timed out ${member.user.tag} for ${formatDuration(duration)} for reason: ${reason}`, ephemeral: true });
            });
        } catch (error) {
            // If an error occurred, return the error and send a message.
            console.log(error);
            return interaction.reply({ content: 'An error occurred while timing out the user.', ephemeral: true });
        }
    }
};

module.exports = command;
