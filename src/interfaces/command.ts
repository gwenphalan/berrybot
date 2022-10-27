import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Client } from './Client';

export interface Command {
    developer?: boolean,
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup" | "addBooleanOption" | "addUserOption" | "addChannelOption" | "addRoleOption" | "addAttachmentOption" | "addMentionableOption" | "addStringOption" | "addIntegerOption" | "addNumberOption">;
    execute(interaction: ChatInputCommandInteraction, client: Client): void;
}