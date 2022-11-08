import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, SelectMenuBuilder } from 'discord.js';
import { util } from '..';
import { MessageBuilder } from '../interfaces';

export const roleCategorySelect: MessageBuilder = {
    embeds: [],
    components: [],
    async build(client, guild: Guild, action: 'view' | 'edit') {
        const categories = (await client.database.guildSettings.get(guild.id))?.selfRoles?.categories;

        if (!categories || categories.length === 0) {
            this.embeds.push(
                new EmbedBuilder()
                    .setDescription(`This server has no Self Role categories.`)
                    .setTitle(`${guild.name}'s Self Roles`)
                    .setColor(await util.Color.getGuildColor(guild))
            );
            this.components.push(
                new ActionRowBuilder<ButtonBuilder>().addComponents([
                    new ButtonBuilder().setCustomId('role-category[{"action":"create"}]').setLabel('Create').setStyle(ButtonStyle.Success).setEmoji('➕')
                ])
            );
        } else {
            this.components.push(
                new ActionRowBuilder<SelectMenuBuilder>().addComponents([
                    new SelectMenuBuilder()
                        .setCustomId(`role-category[{"action":"${action}"}]`)
                        .setPlaceholder('Select a category')
                        .addOptions(
                            categories.map(category => {
                                return {
                                    label: category.name,
                                    value: category.name,
                                    emoji: category.emoji || '➖'
                                };
                            })
                        )
                ])
            );
        }

        return {
            embeds: this.embeds,
            components: this.components
        };
    }
};
