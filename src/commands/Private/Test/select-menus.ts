import { ActionRowBuilder, ChatInputCommandInteraction, SelectMenuBuilder } from 'discord.js';
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

        const menu = new SelectMenuBuilder()
            .setCustomId('test-select')
            .setPlaceholder('Test Select')
            .setMinValues(1)
            .addOptions([
                {
                    label: 'Test Option 1',
                    value: 'test-option-1'
                },
                {
                    label: 'Test Option 2',
                    value: 'test-option-2'
                },
                {
                    label: 'Test Option 3',
                    value: 'test-option-3'
                }
            ]);

        if (type === 'single') menu.setMaxValues(1);
        else menu.setCustomId('test-multi-select').setMaxValues(3);

        row.addComponents(menu);

        return interaction.reply({ content: 'Test Select Menu', components: [row] });
    }
};

module.exports = command;
