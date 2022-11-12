import { ActionRowBuilder, ChatInputCommandInteraction, SelectMenuBuilder } from 'discord.js';
import { selectMenus } from '../../../components';
import { Command } from '../../../interfaces';

const command: Command = {
    subCommand: 'test.select-menus',
    async execute(interaction: ChatInputCommandInteraction, _client) {
        // Return if the interaction wasn't used in a guild.
        if (!interaction.guild) {
            return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
        }

        const type: 'single' | 'multi' = interaction.options.getString('type', true) as 'single' | 'multi';

        const row = new ActionRowBuilder<SelectMenuBuilder>();

        switch (type) {
            case 'single':
                row.addComponents(await selectMenus.TestSelect.build(_client));
                break;
            case 'multi':
                row.addComponents(await selectMenus.TestMultiSelect.build(_client));
                break;
        }

        return await interaction.reply({ content: 'Test Select Menu', components: [row] });
    }
};

module.exports = command;
