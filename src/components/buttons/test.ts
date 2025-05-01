import { ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '../../interfaces/MessageComponent';

export const MessageComponent: ButtonComponent = {
	id: 'test-button',
	type: ComponentTypes.Button,
	permissions: [PermissionFlagsBits.ManageEvents, PermissionFlagsBits.ManageRoles],
	async build(client) {
		const testJSON = {
			type: 'modal',
			id: 'mod_history',
			userId: '123456789012345678',
			page: 2,
			filters: {
				sort: 'recent',
				category: 'moderation',
				tags: ['bans', 'kicks', 'mutes'],
				priority: 'high',
				resolved: false,
			},
		};
		return new ButtonBuilder()
			.setCustomId(await client.getCustomID(this.id, testJSON))
			.setLabel('Test Button')
			.setStyle(ButtonStyle.Primary);
	},
	execute(
		interaction,
		_client,
		data: {
			boolean: boolean;
			number: number;
			string: string;
			array: number[];
		}
	) {
		console.log(data);
		interaction.reply({
			content: `This is a test button!`,
			ephemeral: true,
		});
	},
};

export default MessageComponent;
