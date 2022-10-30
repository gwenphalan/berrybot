import { APISelectMenuOption, SelectMenuInteraction } from 'discord.js';

export type SingleSelectMenu = {
    custom_id: string;
    multi_select?: false | undefined;
    execute(interaction: SelectMenuInteraction, selected: APISelectMenuOption): void;
};

export type MultiSelectMenu = {
    custom_id: string;
    multi_select: true;
    execute(interaction: SelectMenuInteraction, selected: APISelectMenuOption[]): void;
};

export type SelectMenu = SingleSelectMenu | MultiSelectMenu;
