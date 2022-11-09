import { Guild, SelectMenuBuilder } from 'discord.js';
import { ComponentTypes, SelectMenuComponent } from '../../interfaces/MessageComponent';

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

    execute(interaction, _client, selected) {
        // Reply to the interaction with the selected option's label
        interaction.reply({ content: `You selected ${selected.label}`, ephemeral: true });
    }
};

export default MessageComponent;
