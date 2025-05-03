import { ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '../../interfaces/MessageComponent';
import { selfRoleSettings } from '../../messages';
import { RoleCategory } from '../../messages/role-category';

// Navigation button for returning to previous role management views
export const MessageComponent: ButtonComponent = {
	id: 'roles-back',
	type: ComponentTypes.Button,
	permissions: [PermissionFlagsBits.ManageRoles],
	async build(client, data?: { category: string; page: 'view' | 'edit' }) {
		return new ButtonBuilder()
			.setCustomId(client.getCustomID('roles-back', data))
			.setLabel('Back')
			.setStyle(ButtonStyle.Secondary)
			.setEmoji('⬅️');
	},
	async execute(
		interaction,
		client,
		data?: {
			category: string;
			page: 'view' | 'edit';
		}
	) {
		const guild = interaction.guild;
		if (!guild) return;

		// Navigate to category view or main settings based on context
		if (data)
			return interaction.update(
				await RoleCategory.build(client, guild, data.page, data.category)
			);
		else return interaction.update(await selfRoleSettings.build(client, guild));
	},
};

export default MessageComponent;
