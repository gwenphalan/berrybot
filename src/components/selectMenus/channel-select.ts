// Channel selection menu for role message placement
import {
	ActionRowBuilder,
	ButtonBuilder,
	ChannelType,
	EmbedBuilder,
	Guild,
	PermissionFlagsBits,
	StringSelectMenuBuilder,
} from 'discord.js';
import { util } from '../../bot';
import { ComponentTypes, SelectMenuComponent } from '../../interfaces/MessageComponent';
import { RoleMessage } from '../../messages/role-select';
import BackButton from '../buttons/roles-back';

export const MessageComponent: SelectMenuComponent = {
	id: 'channel-select',
	type: ComponentTypes.SelectMenu,
	permissions: [PermissionFlagsBits.ManageRoles],

	async build(_client, guild: Guild) {
		// Create single-select menu for channel selection
		const channelSelectMenu = new StringSelectMenuBuilder()
			.setCustomId(this.id)
			.setPlaceholder('Select a channel')
			.setMinValues(1)
			.setMaxValues(1);

		const botMember = guild.members.me;
		if (!botMember) return channelSelectMenu;

		// Filter channels based on bot permissions
		guild.channels.cache
			.filter((channel) => {
				// Only include text channels
				if (channel.type !== ChannelType.GuildText) return false;

				const permissions = channel.permissionsFor(botMember);
				if (!permissions) return false;

				// Check if bot has required permissions
				return (
					permissions.has(PermissionFlagsBits.SendMessages) &&
					permissions.has(PermissionFlagsBits.EmbedLinks)
				);
			})
			.forEach((channel) => {
				channelSelectMenu.addOptions({
					label: channel.name,
					value: channel.id,
				});
			});

		return channelSelectMenu;
	},

	async execute(interaction, client, selected) {
		if (!interaction.guild) return;

		// Send role message to selected channel
		await RoleMessage(client, interaction.guild, selected.value).catch((err) =>
			interaction.reply({ content: err.message, components: [], ephemeral: true })
		);

		// Update interaction with success message
		return interaction
			.update({
				embeds: [
					new EmbedBuilder()
						.setTitle('Role Select')
						.setDescription(`Sent message to <#${selected.value}>`)
						.setColor(await util.Color.getGuildColor(interaction.guild)),
				],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents([
						await BackButton.build(client),
					]),
				],
			})
			.catch((err) => console.error(err));
	},
};

export default MessageComponent;
