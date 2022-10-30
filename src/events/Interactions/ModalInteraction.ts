import { Events, ModalSubmitInteraction } from 'discord.js';
import { Client } from '../../interfaces/Client';
import { Event } from '../../interfaces/event';

export const event: Event = {
    name: Events.InteractionCreate,
    execute(interaction: ModalSubmitInteraction, client: Client) {
        if (!interaction.isModalSubmit()) return;

        // Get the modal from the client.
        const modal = client.modals.get(interaction.customId);
        // If the modal does not exist, return.
        if (!modal) return;

        const fields = interaction.fields.fields;

        modal.execute(interaction, fields);
    }
};
