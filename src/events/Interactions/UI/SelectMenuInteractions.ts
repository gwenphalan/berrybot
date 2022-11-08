import { SelectMenuInteraction, Events, SelectMenuComponent } from 'discord.js';
import { Client } from '../../../interfaces/Client';
import { Event } from '../../../interfaces/event';
import { SelectMenu } from '../../../interfaces/selectMenu';

export const event: Event = {
    name: Events.InteractionCreate,
    execute(interaction: SelectMenuInteraction, client: Client) {
        if (!interaction.isSelectMenu()) return;

        // Get the label from the custom_id (e.g. 'role-select["Role Category"] => 'Role Category')
        const label = interaction.customId.match(/(?<=\[").+?(?=\"])/g)?.[0];

        // Remove the label, if there is one, from the customId and put it into a variable, (e.g. custom_id = 'test-button["test"]' -> custom_id = 'test-button'; custom_id = 'role-select["pronoun"]' -> custom_id = 'role-select'; custom_id = 'role-select' -> custom_id = 'role-select')
        const customId = interaction.customId.replace(/\[.+\]/g, '');

        const selectMenu: SelectMenu | undefined = client.selectMenus.get(customId);

        if (!selectMenu) return;

        // If the user did not select anything, return and send a message.
        if (interaction.values.length == 0) {
            return interaction.reply({ content: 'You did not select anything!', ephemeral: true });
        }

        // Put the Select Menu options into an array
        const selectedOptions = interaction.values;

        // Put the Interaction Options into an array
        const interactionOptions = (interaction.component as SelectMenuComponent).options;

        // If the Select Menu is a single select menu, execute the single select menu, otherwise execute the multi select menu
        if (!selectMenu.multi_select) {
            // Get the selected option
            const selectedOption = interactionOptions.find(option => option.value == selectedOptions[0]);

            // If the selected option is not found, return and send a message.
            if (!selectedOption) {
                return interaction.reply({ content: 'Something went wrong with your selection!', ephemeral: true });
            }

            // Execute the single select menu
            selectMenu.execute(interaction, selectedOption, client);
        } else {
            // Get the selected options
            const selectedOptionsArray = interactionOptions.filter(option => selectedOptions.includes(option.value));

            // If the selected options are not found, return and send a message.
            if (selectedOptionsArray.length == 0) {
                return interaction.reply({ content: 'Something went wrong with your selection!', ephemeral: true });
            }

            // Execute the multi select menu
            return selectMenu.execute(interaction, selectedOptionsArray, client, label);
        }
    }
};
