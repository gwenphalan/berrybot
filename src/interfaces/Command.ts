import type {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from 'discord.js';
import type { Client } from './Client';

export type BaseCommand = {
	parent?: string;
	developer?: boolean;
	guildOnly?: boolean;
	data: SlashCommandBuilder;
	execute(interaction: ChatInputCommandInteraction, client: Client): void;
};

export type SubCommand = {
	parent: string;
	data: SlashCommandSubcommandBuilder;
	execute(interaction: ChatInputCommandInteraction, client: Client): void;
};

export type Command = BaseCommand | SubCommand;
