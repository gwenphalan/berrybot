import type { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Client } from './Client';

export type BaseCommand = {
    subCommand?: undefined | undefined;
    developer?: boolean;
    guildOnly?: boolean;
    data: Omit<
        SlashCommandBuilder,
        | 'addAttachmentOption'
        | 'addBooleanOption'
        | 'addChannelOption'
        | 'addIntegerOption'
        | 'addMentionableOption'
        | 'addNumberOption'
        | 'addRoleOption'
        | 'addStringOption'
        | 'addSubcommand'
        | 'addSubcommandGroup'
        | 'addUserOption'
        | 'addChatInputOption'
    >;
    execute(interaction: ChatInputCommandInteraction, client: Client): void;
};

export type SubCommand = {
    subCommand: string;
    execute(interaction: ChatInputCommandInteraction, client: Client): void;
};

export type Command = BaseCommand | SubCommand;
