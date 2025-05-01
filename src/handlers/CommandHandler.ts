import { SlashCommandSubcommandBuilder, type ApplicationCommandDataResolvable } from 'discord.js';
import type { Client } from '../interfaces/Client';
import type { Command, SubCommand } from '../interfaces';
import { Files } from '../util';
import { BaseCommand } from '../interfaces/Command';

export async function loadCommands(client: Client) {
    const ascii = require('ascii-table');
    const table = new ascii().setHeading('Commands', 'Status');

    await client.commands.clear();
    await client.subCommands.clear();

    const commandsArray: Command[] = [];
    const subCommandsArray: SubCommand[] = [];

    const files = await Files.load('commands');

    console.log('Loading commands...');

    files.forEach(f => {
        try {
            const command: Command = require(f);

            if (command.parent !== null && command.parent !== undefined) {
                subCommandsArray.push(command as SubCommand);
                client.subCommands.set(`${command.parent}.${command.data.name}`, <SubCommand>command);
            }
            else
            {
                client.commands.set(command.data.name, command as BaseCommand);

                commandsArray.push(command);
            }
                
            return table.addRow(command.parent ? `${command.parent}.${command.data.name}` : command.data.name, '🟩');

        } catch (error) {
            const commandName = f.split('/')[f.split('/').length - 1].split('.')[0];
            console.log(`Error loading command ${commandName}`);
            console.error(error);
            return table.addRow(commandName, '🟥');
        }
    });

    subCommandsArray.forEach(command => {
        const parentCommand = client.commands.filter(cmd => cmd.data.name === command.parent).first();

        if (!parentCommand) return;

        parentCommand.data.addSubcommand(command.data as SlashCommandSubcommandBuilder);
    });

    const commandData: ApplicationCommandDataResolvable[] = [];

    commandsArray.forEach(cmd => {
        const data = (cmd.data as any).toJSON();
        commandData.push(data);
    });

    client.application?.commands.set(commandData);

    console.log('\n' + table.toString());

    console.log('Commands Loaded.');
}
