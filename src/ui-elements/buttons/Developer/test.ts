import { ButtonInteraction } from 'discord.js';
import { Button } from '../../../interfaces/button';

const button: Button = {
    custom_id: 'test-button',
    execute(interaction: ButtonInteraction) {
        interaction.reply({ content: 'This is a test button!', ephemeral: true });
    }
};

module.exports = button;
