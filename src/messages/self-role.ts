import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, Guild } from 'discord.js';
import { util } from '../bot';
import { MessageBuilder } from '../interfaces';
import RoleCategory from '../components/buttons/role-category';

export const selfRoleSettings: MessageBuilder = {
    embeds: [],
    components: [],
    async build(client, guild: Guild) {
        const categories = (await client.database.guildSettings.get(guild.id))?.selfRoles.categories;

        let components: ActionRowBuilder<ButtonBuilder>[] = [new ActionRowBuilder<ButtonBuilder>()];
        const embed = new EmbedBuilder().setColor(await util.Color.getGuildColor(guild));

        if (categories.length > 0) {
            embed.setTitle(`Would you like to view, edit, or create a category?`).setDescription(
                `**Categories:**\n${categories
                    .map(c => {
                        return `• ${c.name}`;
                    })
                    .join('\n')}`
            );
            components[0].addComponents([await RoleCategory.build(client, 'view'), await RoleCategory.build(client, 'edit')]);
            components.push(new ActionRowBuilder<ButtonBuilder>().addComponents([await RoleCategory.build(client, 'message')]));
        } else {
            embed.setTitle(`Click the button below to create a self-role category!`);
        }

        components[0].addComponents([await RoleCategory.build(client, 'create')]);

        return {
            embeds: [embed],
            components: components
        };
    }
};
