import { Events, ModalSubmitInteraction } from 'discord.js';
import { Client } from '../../../interfaces/Client';
import { Event } from '../../../interfaces/event';
import { Modal } from '../../../interfaces/modal';

export const event: Event = {
    name: Events.InteractionCreate,
    execute(interaction: ModalSubmitInteraction, client: Client) {
        if (!interaction.isModalSubmit()) return;

        // Get the label from the custom_id (e.g. 'role-select["Role Category"] => 'Role Category')
        const label = interaction.customId.match(/(?<=\[").+?(?=\"])/g)?.[0];

        // Remove the label, if there is one, from the customId and put it into a variable, (e.g. custom_id = 'test-button["test"]' -> custom_id = 'test-button'; custom_id = 'role-select["pronoun"]' -> custom_id = 'role-select'; custom_id = 'role-select' -> custom_id = 'role-select')
        const customId = interaction.customId.replace(/\[.+\]/g, '');

        // Get the modal from the client.
        const modal: Modal | undefined = client.modals.get(customId);
        // If the modal does not exist, return.
        if (!modal) return;

        const fields = interaction.fields.fields;

        modal.execute(interaction, fields, client, label);
    }
};
