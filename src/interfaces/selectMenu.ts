import { APISelectMenuOption, SelectMenuInteraction } from 'discord.js';
import { Client } from './Client';

export type SingleSelectMenu = {
    custom_id: string;
    multi_select?: false | undefined;
    execute(interaction: SelectMenuInteraction, selected: APISelectMenuOption, client: Client, label?: string): void;
};

export type MultiSelectMenu = {
    custom_id: string;
    multi_select: true;
    execute(interaction: SelectMenuInteraction, selected: APISelectMenuOption[], client: Client, label?: string): void;
};

export type SelectMenu = SingleSelectMenu | MultiSelectMenu;
