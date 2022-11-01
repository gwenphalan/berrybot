import { ButtonInteraction } from 'discord.js';
import { Client } from './Client';

export type Button = {
    custom_id: string;
    execute(interaction: ButtonInteraction, client: Client, label?: string): void;
};
