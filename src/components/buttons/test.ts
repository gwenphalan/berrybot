import { ButtonComponent, ComponentTypes } from '../../interfaces/MessageComponent';

const button: ButtonComponent = {
    id: 'test-button',
    type: ComponentTypes.Button,
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

module.exports = button;
