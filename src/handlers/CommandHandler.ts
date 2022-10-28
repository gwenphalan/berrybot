import type {ApplicationCommandDataResolvable} from 'discord.js';
import type {Client} from '../interfaces/Client';
import type {Command, SubCommand} from '../interfaces/command';
import {loadFiles} from '../util/fileLoader';

export async function loadCommands(client: Client) {
	const ascii = require('ascii-table');
	const table = new ascii().setHeading('Commands', 'Status');

	await client.commands.clear();
	await client.subCommands.clear();

	const commandsArray: ApplicationCommandDataResolvable[] = [];

	const files = await loadFiles('commands');

	files.forEach(f => {
		const command: Command = require(f);

		if (command.subCommand !== null && command.subCommand !== undefined) {
			return client.subCommands.set(command.subCommand, (<SubCommand>command));
		}

		client.commands.set(command.data.name, command);

		commandsArray.push(command.data.toJSON());

		return table.addRow(command.data.name, '🟩');
	});

	client.application?.commands.set(commandsArray);

	console.log(table.toString(), '\nCommands Loaded.');
}
