import { SelectMenuInteraction, Events } from 'discord.js';
import { Client } from '../../interfaces/Client';
import { Event } from '../../interfaces/event';
import { SelectMenu } from '../../interfaces/selectMenu';

export const event: Event = {
    name: Events.InteractionCreate,
    execute(interaction: SelectMenuInteraction, client: Client) {
        if (!interaction.isSelectMenu()) return;

        const selectMenu: SelectMenu | undefined = client.selectMenus.get(interaction.customId);

        if (!selectMenu) return;

        // If the user did not select anything, return and send a message.
        if (interaction.values.length == 0) {
            return interaction.reply({ content: 'You did not select anything!', ephemeral: true });
        }

        // Put the Select Menu options into an array
        const selectedOptions = interaction.values;

        // Put the Interaction Options into an array
        const interactionOptions = interaction.component.options;

        // If the Select Menu is a single select menu, execute the single select menu, otherwise execute the multi select menu
        if (!selectMenu.multi_select) {
            // Get the selected option
            const selectedOption = interactionOptions.find(option => option.value == selectedOptions[0]);

            // If the selected option is not found, return and send a message.
            if (!selectedOption) {
                return interaction.reply({ content: 'Something went wrong with your selection!', ephemeral: true });
            }

            // Execute the single select menu
            selectMenu.execute(interaction, selectedOption);
        } else {
            // Get the selected options
            const selectedOptionsArray = interactionOptions.filter(option => selectedOptions.includes(option.value));

            // If the selected options are not found, return and send a message.
            if (selectedOptionsArray.length == 0) {
                return interaction.reply({ content: 'Something went wrong with your selection!', ephemeral: true });
            }

            // Execute the multi select menu
            return selectMenu.execute(interaction, selectedOptionsArray);
        }
    }
};
