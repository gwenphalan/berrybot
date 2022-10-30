import { ButtonInteraction, Events } from 'discord.js';
import { Button } from '../../interfaces/button';
import { Client } from '../../interfaces/Client';
import { Event } from '../../interfaces/event';

export const event: Event = {
    name: Events.InteractionCreate,
    execute(interaction: ButtonInteraction, client: Client) {
        if (!interaction.isButton()) return;

        const button: Button | undefined = client.buttons.get(interaction.customId);

        if (!button) return;

        button.execute(interaction);
    }
};
