import { SlashCommandSubcommandBuilder, type ApplicationCommandDataResolvable } from 'discord.js';
import type { Command, SubCommand } from '../interfaces';
import type { Client } from '../interfaces/Client';
import { BaseCommand } from '../interfaces/Command';
import { load } from '../util/Files';
import { logger } from '../util/Logger';

export async function loadCommands(client: Client) {
	const ascii = require('ascii-table');
	const table = new ascii().setHeading('Commands', 'Status');

	await client.commands.clear();
	await client.subCommands.clear();

	const commandsArray: Command[] = [];
	const subCommandsArray: SubCommand[] = [];

	try {
		const files = await load('commands');
		logger.debug('Files loaded:', files);

		logger.info('Loading commands...');

		files.forEach((f) => {
			try {
				logger.debug('Loading command from file:', f);
				const command: Command = require(f);
				logger.debug('Loaded command:', command);

				if (!command || !command.data || !command.execute) {
					throw new Error(`Invalid command file: ${f}`);
				}

				if (command.parent !== null && command.parent !== undefined) {
					logger.debug('Adding subcommand:', command.data.name);
					subCommandsArray.push(command as SubCommand);
					client.subCommands.set(
						`${command.parent}.${command.data.name}`,
						<SubCommand>command
					);
				} else {
					logger.debug('Adding main command:', command.data.name);
					client.commands.set(command.data.name, command as BaseCommand);
					commandsArray.push(command);
				}

				table.addRow(
					command.parent ? `${command.parent}.${command.data.name}` : command.data.name,
					'🟩'
				);
			} catch (error) {
				logger.error('Error loading command:', f, error);
				const commandName = f.split('/')[f.split('/').length - 1].split('.')[0];
				logger.error(error);
				table.addRow(commandName, '🟥');
				throw error;
			}
		});

		logger.debug('Commands array:', commandsArray);
		logger.debug('Subcommands array:', subCommandsArray);

		subCommandsArray.forEach((command) => {
			const parentCommand = client.commands
				.filter((cmd) => cmd.data.name === command.parent)
				.first();

			if (!parentCommand) return;

			parentCommand.data.addSubcommand(command.data as SlashCommandSubcommandBuilder);
		});

		const commandData: ApplicationCommandDataResolvable[] = [];

		commandsArray.forEach((cmd) => {
			const data = (cmd.data as any).toJSON();
			commandData.push(data);
		});

		logger.debug('Command data to register:', commandData);
		await client.application?.commands.set(commandData);

		logger.info('\n' + table.toString());
		logger.info('Commands Loaded.');
	} catch (error) {
		logger.error('Error in loadCommands:', error);
		logger.error(error);
		throw error;
	}
}
