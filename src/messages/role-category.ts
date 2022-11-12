import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, Guild } from 'discord.js';
import { util } from '../bot';
import { MessageBuilder } from '../interfaces';
import EditButtons from '../components/buttons/category-edit';
import EditButton from '../components/buttons/role-category';
import BackButton from '../components/buttons/roles-back';

export const RoleCategory: MessageBuilder = {
    embeds: [new EmbedBuilder()],
    components: [],
    async build(client, guild: Guild, action: 'view' | 'edit', category: string) {
        const c = (await client.database.guildSettings.get(guild.id))?.selfRoles?.categories.find(c => c.name === category);

        const components = [];

        this.embeds[0].setTitle(`Self Roles - ${category}`).setColor(await util.Color.getGuildColor(guild));

        if (!c) this.embeds[0].setDescription(`This category does not exist.`);
        else
            this.embeds[0].setFields([
                {
                    name: 'Name',
                    value: c.name,
                    inline: true
                },
                {
                    name: 'Emoji',
                    value: c.emoji,
                    inline: true
                },
                {
                    name: 'Roles',
                    value: c.roles?.length > 0 ? c.roles.map(role => `<@&${role}>`).join(', ') : 'None'
                }
            ]);

        if (action === 'edit') {
            components.push(
                new ActionRowBuilder<ButtonBuilder>().setComponents([
                    await EditButtons.build(client, 'name', category),
                    await EditButtons.build(client, 'emoji', category),
                    await EditButtons.build(client, 'roles', category),
                    await EditButtons.build(client, 'delete', category)
                ])
            );

            components.push(new ActionRowBuilder<ButtonBuilder>().setComponents([await BackButton.build(client)]));
        } else {
            components.push(
                new ActionRowBuilder<ButtonBuilder>().setComponents([await BackButton.build(client), await EditButton.build(client, 'edit', category)])
            );
        }

        return {
            embeds: this.embeds,
            components: components
        };
    }
};
