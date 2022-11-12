import type { ApplicationCommandDataResolvable } from 'discord.js';
import type { Client } from '../interfaces/Client';
import type { Command, SubCommand } from '../interfaces';
import { Files } from '../util';

export async function loadCommands(client: Client) {
    const ascii = require('ascii-table');
    const table = new ascii().setHeading('Commands', 'Status');

    await client.commands.clear();
    await client.subCommands.clear();

    const commandsArray: ApplicationCommandDataResolvable[] = [];

    const files = await Files.load('commands');

    files.forEach(f => {
        try {
            const command: Command = require(f);

            if (command.subCommand !== null && command.subCommand !== undefined) {
                return client.subCommands.set(command.subCommand, <SubCommand>command);
            }

            client.commands.set(command.data.name, command);

            commandsArray.push(command.data.toJSON());

            return table.addRow(command.data.name, '🟩');
        } catch (error) {
            const commandName = f.split('/')[f.split('/').length - 1].split('.')[0];
            console.log(`Error loading command ${commandName}: ${error}`);
            return table.addRow(commandName, '🟥');
        }
    });

    client.application?.commands.set(commandsArray);

    console.log('\n' + table.toString());

    console.log('Commands Loaded.');
}
