import { Guild, SelectMenuBuilder } from 'discord.js';
import { ComponentTypes, SelectMenuComponent } from '../../interfaces/MessageComponent';
import { RoleCategory } from '../../messages/role-category';

export const MessageComponent: SelectMenuComponent = {
    id: 'role-category',
    type: ComponentTypes.SelectMenu,

    async build(client, guild: Guild, action: 'view' | 'edit') {
        const categories = (await client.database.guildSettings.get(guild.id)).selfRoles?.categories;

        const data = {
            action: action
        };

        const builder = new SelectMenuBuilder().setCustomId(client.getCustomID('role-category', data)).setPlaceholder('Select Category');

        if (!categories) builder.setDisabled().setPlaceholder('No categories to select');
        else builder.addOptions(categories.map(c => ({ label: c.name, value: c.name, emoji: c.emoji })));

        return builder;
    },

    async execute(interaction, client, selected, data: { action: 'view' | 'edit' }) {
        if (!selected || !interaction.guild) return interaction.reply({ content: 'You must select at least one category.', ephemeral: true });

        return interaction.update(await RoleCategory.build(client, interaction.guild, data.action, selected.value));
    }
};

export default MessageComponent;
