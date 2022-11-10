import * as discord from 'discord.js';
import { Client } from './';

type ComponentInteraction = discord.ButtonInteraction | discord.SelectMenuInteraction | discord.ModalSubmitInteraction;
export enum ComponentTypes {
    Button = 'BUTTON',
    SelectMenu = 'SELECT_MENU',
    Modal = 'MODAL'
}

export interface BaseMessageComponent {
    id: string;
    type: ComponentTypes;
    multi_select?: boolean;
    permissions?: bigint[];
    developer?: boolean;
    execute(
        interaction: ComponentInteraction,
        client: Client,
        data?: { [key: string]: any },
        guild?: discord.Guild,
        response?: discord.Collection<string, discord.TextInputComponent>,
        selected?: discord.APISelectMenuOption | discord.APISelectMenuOption[]
    ): void;
    build(client: Client, ...args: any): Promise<discord.ButtonBuilder> | Promise<discord.SelectMenuBuilder> | Promise<discord.ModalBuilder>;
}

export interface ButtonComponent extends Omit<BaseMessageComponent, 'multi_select'> {
    type: ComponentTypes.Button;
    execute(interaction: discord.ButtonInteraction, client: Client, data?: { [key: string]: any }, guild?: discord.Guild): void;
    build(client: Client, ...args: any): Promise<discord.ButtonBuilder>;
}

export interface SingleSelectMenuComponent extends Omit<BaseMessageComponent, 'execute' | 'multi_select'> {
    type: ComponentTypes.SelectMenu;
    multi_select?: false;
    execute(
        interaction: discord.SelectMenuInteraction,
        client: Client,
        selected: discord.APISelectMenuOption,
        data?: { [key: string]: any },
        guild?: discord.Guild
    ): void;
    build(client: Client, ...args: any): Promise<discord.SelectMenuBuilder>;
}

export interface MultiSelectMenuComponent extends Omit<BaseMessageComponent, 'execute'> {
    type: ComponentTypes.SelectMenu;
    multi_select: true;
    execute(
        interaction: discord.SelectMenuInteraction,
        client: Client,
        selected: discord.APISelectMenuOption[],
        data?: { [key: string]: any },
        guild?: discord.Guild
    ): void;
    build(client: Client, ...args: any): Promise<discord.SelectMenuBuilder>;
}

export type SelectMenuComponent = SingleSelectMenuComponent | MultiSelectMenuComponent;

export interface ModalComponent extends Omit<BaseMessageComponent, 'execute' | 'multi_select'> {
    id: string;
    type: ComponentTypes.Modal;
    execute(
        interaction: ComponentInteraction,
        client: Client,
        response: discord.Collection<string, discord.TextInputComponent>,
        data?: { [key: string]: any },
        guild?: discord.Guild
    ): void;
    build(client: Client, ...args: any): Promise<discord.ModalBuilder>;
}

export type MessageComponent = ButtonComponent | SelectMenuComponent | ModalComponent;
