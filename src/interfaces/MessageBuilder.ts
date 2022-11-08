import * as discord from 'discord.js';
import { Client } from './Client';

export interface MessageBuilder {
    embeds: discord.EmbedBuilder[];
    components: discord.ActionRowBuilder<discord.ButtonBuilder | discord.SelectMenuBuilder>[];
    build(client: Client, ...args: any): discord.BaseMessageOptions;
}
