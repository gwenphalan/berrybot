import { BaseInteraction, Events, SelectMenuComponent } from 'discord.js';
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

        if (interaction.isButton()) {
            const button: ButtonComponent | undefined = client.messageComponents.get(componentName) as ButtonComponent;

            if (!button) return;

            button.execute(interaction, client, data.data);
        } else if (interaction.isSelectMenu()) {
            const selectMenu: SingleSelectMenuComponent | MultiSelectMenuComponent | undefined = client.messageComponents.get(componentName) as
                | SingleSelectMenuComponent
                | MultiSelectMenuComponent;

            if (!selectMenu) return;

            const options = (interaction.component as SelectMenuComponent).options;
            const selectedOptions = interaction.values;
            const selectedOption = options.find(option => option.value == selectedOptions[0]);

            // If the selected options are not found, return and send a message.
            if (selectedOptions.length == 0 || !selectedOption) {
                return interaction.reply({ content: 'Something went wrong with your selection!', ephemeral: true });
            }

            if (selectMenu.multi_select) {
                selectMenu.execute(
                    interaction,
                    client,
                    options.filter(option => selectedOptions.includes(option.value)),
                    data.data
                );
            } else {
                selectMenu.execute(interaction, client, selectedOption, data.data);
            }
        } else if (interaction.isModalSubmit()) {
            const modal: ModalComponent | undefined = client.messageComponents.get(componentName) as ModalComponent;

            if (!modal) return;

            const fields = interaction.fields.fields;

            modal.execute(interaction, client, fields, data.data);
        }
        return;
    }
};
