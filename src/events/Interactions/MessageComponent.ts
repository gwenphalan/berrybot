import {
	BaseInteraction,
	Events,
	PermissionsBitField,
	StringSelectMenuInteraction,
	InteractionType,
	MessageComponentInteraction,
	ModalSubmitInteraction,
} from 'discord.js';
import { config } from '../../config';
import { Client, Event } from '../../interfaces';
import {
	ButtonComponent,
	ModalComponent,
	MultiSelectMenuComponent,
	SingleSelectMenuComponent,
} from '../../interfaces/MessageComponent';
import { decompressFromUTF16 } from 'lz-string';

export function parseData(customId: string): {
	id: string;
	data: ((this: any, key: string, value: any) => any) | undefined;
} {
	const regex = /\[(.*)\]/;
	const match = regex.exec(customId);
	if (match) {
		const data = JSON.parse(decompressFromUTF16(match[1]));
		const id = customId.replace(regex, '');
		return { id, data };
	}
	return { id: customId, data: undefined };
}

export const event: Event = {
	name: Events.InteractionCreate,
	/**
	 *
	 * @param {MessageComponentInteraction} interaction
	 */
	execute(interaction: BaseInteraction, client: Client) {
		if (interaction.type !== InteractionType.MessageComponent) return;
		const messageComponentInteraction = interaction as MessageComponentInteraction;

		const data = parseData(messageComponentInteraction.customId);

		let type: 'button' | 'selectMenu' | 'modal';

		if (messageComponentInteraction.isButton()) {
			type = 'button';
		} else if (messageComponentInteraction.isStringSelectMenu()) {
			type = 'selectMenu';
		} else {
			type = 'modal';
		}

		const componentName = `${data.id}:${type}`;

		const component = client.messageComponents.get(componentName);

		if (!component) return;

		if (component.developer && config.developer !== messageComponentInteraction.user.id)
			return messageComponentInteraction.reply({
				content: 'This is a developer only component.',
				ephemeral: true,
			});

		const member = messageComponentInteraction.member
			? messageComponentInteraction.guild?.members.cache.get(
					messageComponentInteraction.member.user.id
				)
			: null;

		if (member) {
			const permissions = new PermissionsBitField();

			component.permissions?.forEach((p) => permissions.add(p));

			if (!member.permissions.has(permissions)) {
				return messageComponentInteraction.reply({
					content: 'You do not have permission to do this.',
					ephemeral: true,
				});
			}
		}

		if (messageComponentInteraction.isButton()) {
			const button: ButtonComponent = component as ButtonComponent;

			button.execute(messageComponentInteraction, client, data.data);
		} else if (messageComponentInteraction.isStringSelectMenu()) {
			const selectMenu: SingleSelectMenuComponent | MultiSelectMenuComponent = component as
				| SingleSelectMenuComponent
				| MultiSelectMenuComponent;
			const stringInteraction = messageComponentInteraction as StringSelectMenuInteraction;
			const options = stringInteraction.component.options;
			const selectedOptions = stringInteraction.values;
			const selectedOption = options.find((option) => option.value === selectedOptions[0]);

			if (selectMenu.multi_select) {
				selectMenu.execute(
					messageComponentInteraction,
					client,
					options.filter((option) => selectedOptions.includes(option.value)),
					data.data
				);
			} else {
				if (!selectedOption) {
					return messageComponentInteraction.reply({
						content: 'Something went wrong with your selection!',
						ephemeral: true,
					});
				}
				selectMenu.execute(messageComponentInteraction, client, selectedOption, data.data);
			}
		} else if (messageComponentInteraction.isModalSubmit()) {
			const modal: ModalComponent = component as ModalComponent;
			const modalInteraction = messageComponentInteraction as ModalSubmitInteraction;

			const fields = modalInteraction.fields.fields;

			modal.execute(modalInteraction, client, fields, data.data);
		}
		return;
	},
};
