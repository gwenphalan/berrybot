import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { ButtonComponent, ComponentTypes } from '../../interfaces/MessageComponent';

export const MessageComponent: ButtonComponent = {
    id: 'test-button',
    type: ComponentTypes.Button,
    async build(client) {
        const testJSON = {
            boolean: true,
            number: 1,
            string: 'test',
            array: [1, 2, 3]
        };
        return new ButtonBuilder()
            .setCustomId(await client.getCustomID('test-button', testJSON))
            .setLabel('Test Button')
            .setStyle(ButtonStyle.Primary);
    },
    execute(
        interaction,
        _client,
        data: {
            boolean: boolean;
            number: number;
            string: string;
            array: number[];
        }
    ) {
        interaction.reply({
            content: `This is a test button!\n ${data.boolean}\n ${data.number}\n ${data.string}\n ${data.array}`,
            ephemeral: true
        });
    }
};

export default MessageComponent;
