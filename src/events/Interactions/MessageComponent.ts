import { BaseInteraction, Events, PermissionsBitField, SelectMenuComponent } from 'discord.js';
import { config } from '../../config';
import { Client, Event } from '../../interfaces';
import { ButtonComponent, ModalComponent, MultiSelectMenuComponent, SingleSelectMenuComponent } from '../../interfaces/MessageComponent';

export function parseData(customId: string): { id: string; data: ((this: any, key: string, value: any) => any) | undefined } {
    const regex = /\[(.*)\]/;
    const match = regex.exec(customId);
    if (match) {
        const data = JSON.parse(match[1]);
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
        if (!interaction.isSelectMenu() && !interaction.isButton() && !interaction.isModalSubmit()) return;

        const data = parseData(interaction.customId);

        let type: 'button' | 'selectMenu' | 'modal';

        if (interaction.isButton()) {
            type = 'button';
        } else if (interaction.isSelectMenu()) {
            type = 'selectMenu';
        } else {
            type = 'modal';
        }

        const componentName = `${data.id}:${type}`;

        const component = client.messageComponents.get(componentName);

        if (!component) return;

        if (component.developer && config.developer !== interaction.user.id)
            return interaction.reply({ content: 'This is a developer only component.', ephemeral: true });

        const member = interaction.member ? interaction.guild?.members.cache.get(interaction.member.user.id) : null;

        if (member) {
            const permissions = new PermissionsBitField();

            component.permissions?.forEach(p => permissions.add(p));

            if (!member.permissions.has(permissions)) {
                return interaction.reply({ content: 'You do not have permission to do this.', ephemeral: true });
            }
        }

        if (interaction.isButton()) {
            const button: ButtonComponent = component as ButtonComponent;

            button.execute(interaction, client, data.data);
        } else if (interaction.isSelectMenu()) {
            const selectMenu: SingleSelectMenuComponent | MultiSelectMenuComponent = component as SingleSelectMenuComponent | MultiSelectMenuComponent;

            const options = (interaction.component as SelectMenuComponent).options;
            const selectedOptions = interaction.values;
            const selectedOption = options.find(option => option.value == selectedOptions[0]);

            if (selectMenu.multi_select) {
                selectMenu.execute(
                    interaction,
                    client,
                    options.filter(option => selectedOptions.includes(option.value)),
                    data.data
                );
            } else {
                if (!selectedOption) {
                    return interaction.reply({ content: 'Something went wrong with your selection!', ephemeral: true });
                }
                selectMenu.execute(interaction, client, selectedOption, data.data);
            }
        } else if (interaction.isModalSubmit()) {
            const modal: ModalComponent = component as ModalComponent;

            const fields = interaction.fields.fields;

            modal.execute(interaction, client, fields, data.data);
        }
        return;
    }
};
