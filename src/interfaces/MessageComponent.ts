import { APISelectMenuOption, ButtonInteraction, Collection, Guild, ModalSubmitInteraction, SelectMenuInteraction, TextInputComponent } from 'discord.js';
import { Client } from './';

type ComponentInteraction = ButtonInteraction | SelectMenuInteraction | ModalSubmitInteraction;
export enum ComponentTypes {
    Button = 'BUTTON',
    SelectMenu = 'SELECT_MENU',
    Modal = 'MODAL'
}

export interface BaseMessageComponent {
    id: string;
    type: ComponentTypes;
    multi_select?: boolean;
    developer?: boolean;
    execute(
        interaction: ComponentInteraction,
        client: Client,
        data?: { [key: string]: any },
        guild?: Guild,
        response?: Collection<string, TextInputComponent>,
        selected?: APISelectMenuOption | APISelectMenuOption[]
    ): void;
}

export interface ButtonComponent extends Omit<BaseMessageComponent, 'multi_select'> {
    type: ComponentTypes.Button;
    execute(interaction: ButtonInteraction, client: Client, data?: { [key: string]: any }, guild?: Guild): void;
}

export interface SingleSelectMenuComponent extends Omit<BaseMessageComponent, 'execute'> {
    type: ComponentTypes.SelectMenu;
    multi_select?: false;
    execute(interaction: SelectMenuInteraction, client: Client, selected: APISelectMenuOption, data?: { [key: string]: any }, guild?: Guild): void;
}

export interface MultiSelectMenuComponent extends Omit<BaseMessageComponent, 'execute'> {
    type: ComponentTypes.SelectMenu;
    multi_select: true;
    execute(interaction: SelectMenuInteraction, client: Client, selected: APISelectMenuOption[], data?: { [key: string]: any }, guild?: Guild): void;
}

export type SelectMenuComponent = SingleSelectMenuComponent | MultiSelectMenuComponent;

export interface ModalComponent extends Omit<BaseMessageComponent, 'execute' | 'multi_select'> {
    id: string;
    type: ComponentTypes.Modal;
    execute(
        interaction: ComponentInteraction,
        client: Client,
        response: Collection<string, TextInputComponent>,
        data?: { [key: string]: any },
        guild?: Guild
    ): void;
}

export type MessageComponent = ButtonComponent | SelectMenuComponent | ModalComponent;
