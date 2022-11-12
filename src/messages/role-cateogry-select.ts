import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, SelectMenuBuilder } from 'discord.js';
import { util } from '../bot';
import { MessageBuilder } from '../interfaces';
import RoleCategory from '../components/selectMenus/role-category';
import BackButton from '../components/buttons/roles-back';

export const roleCategorySelect: MessageBuilder = {
    embeds: [],
    components: [],
    async build(client, guild: Guild, action: 'view' | 'edit') {
        const categories = (await client.database.guildSettings.get(guild.id))?.selfRoles?.categories;

        const components: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[] = [];

        if (!categories || categories.length === 0) {
            this.embeds = [
                new EmbedBuilder()
                    .setDescription(`This server has no Self Role categories.`)
                    .setTitle(`${guild.name}'s Self Roles`)
                    .setColor(await util.Color.getGuildColor(guild))
            ];
            components.push(
                new ActionRowBuilder<ButtonBuilder>().addComponents([
                    await BackButton.build(client),
                    new ButtonBuilder().setCustomId('role-category[{"action":"create"}]').setLabel('Create').setStyle(ButtonStyle.Success).setEmoji('➕')
                ])
            );
        } else {
            components.push(new ActionRowBuilder<SelectMenuBuilder>().addComponents(await RoleCategory.build(client, guild, action)));
            components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(await BackButton.build(client)));
        }

        return {
            embeds: this.embeds,
            components: components
        };
    }
};
