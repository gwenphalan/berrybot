import { Collection, ModalSubmitInteraction, TextInputComponent } from 'discord.js';

export type Modal = {
    custom_id: string;
    execute(interaction: ModalSubmitInteraction, response: Collection<string, TextInputComponent>): void;
};
