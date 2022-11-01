import { ButtonInteraction, Events } from 'discord.js';
import { Button } from '../../interfaces/button';
import { Client } from '../../interfaces/Client';
import { Event } from '../../interfaces/event';

export const event: Event = {
    name: Events.InteractionCreate,
    async execute(interaction: ButtonInteraction, client: Client) {
        if (!interaction.isButton()) return;

        console.log(`Received button interaction: ${interaction.customId} from ${interaction.user.tag}`);

        // Get the label from the custom_id (e.g. 'role-select["Role Category"] => 'Role Category')
        const label = interaction.customId.match(/(?<=\[").+?(?=\"])/g)?.[0];

        // Remove the label, if there is one, from the customId and put it into a variable, (e.g. custom_id = 'test-button["test"]' -> custom_id = 'test-button'; custom_id = 'role-select["pronoun"]' -> custom_id = 'role-select'; custom_id = 'role-select' -> custom_id = 'role-select')
        const customId = interaction.customId.replace(/\[.+\]/g, '');

        const button: Button | undefined = client.buttons.find(button => button.custom_id === customId);

        if (!button) return console.log(`No button found with custom_id: ${customId}`);

        await button.execute(interaction, client, label);
        console.log(`Executed button: ${interaction.customId}`);
    }
};
