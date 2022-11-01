import { Collection, ModalSubmitInteraction, TextInputComponent } from 'discord.js';
import { Client } from './Client';

export type Modal = {
    custom_id: string;
    execute(interaction: ModalSubmitInteraction, response: Collection<string, TextInputComponent>, client: Client, label?: string): void;
};
