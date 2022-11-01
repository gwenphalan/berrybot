import type { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Client } from './Client';

export type BaseCommand = {
    subCommand?: undefined | undefined;
    developer?: boolean;
    guildOnly?: boolean;
    data: Omit<
        SlashCommandBuilder,
        | 'addSubcommand'
        | 'addSubcommandGroup'
        | 'addBooleanOption'
        | 'addUserOption'
        | 'addChannelOption'
        | 'addRoleOption'
        | 'addAttachmentOption'
        | 'addMentionableOption'
        | 'addStringOption'
        | 'addIntegerOption'
        | 'addNumberOption'
    >;
    execute(interaction: ChatInputCommandInteraction, client: Client): void;
};

export type SubCommand = {
    subCommand: string;
    execute(interaction: ChatInputCommandInteraction, client: Client): void;
};

export type Command = BaseCommand | SubCommand;
