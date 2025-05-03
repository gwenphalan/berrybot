import { SlashCommandSubcommandBuilder, type ApplicationCommandDataResolvable } from 'discord.js';
import type { Command, SubCommand } from '../interfaces';
import type { Client } from '../interfaces/Client';
import { BaseCommand } from '../interfaces/Command';
import { load } from '../util/Files';
import { logger } from '../util/Logger';

// Main function to load and register all commands with Discord
export async function loadCommands(client: Client) {
	const ascii = require('ascii-table');
	const table = new ascii().setHeading('Commands', 'Status');

	// Clear existing commands before loading new ones in case of command reload
	logger.debug('Clearing existing commands and subcommands...');
	await client.commands.clear();
	await client.subCommands.clear();
	logger.debug(
		`Cleared ${client.commands.size} commands and ${client.subCommands.size} subcommands`
	);

	const commandsArray: Command[] = [];
	const subCommandsArray: SubCommand[] = [];

	try {
		// Load all command files from the commands directory
		logger.debug('Scanning commands directory...');
		const files = await load('commands');
		logger.debug(`Found ${files.length} command files to load`);

		logger.info('Loading commands...');

		// Process each command file
		files.forEach((f) => {
			try {
				const commandName = f.split('/')[f.split('/').length - 1].split('.')[0];
				logger.debug(`Processing command file: ${commandName}`);

				const command: Command = require(f);
				logger.debug(`Loaded command: ${command.data.name}`);

				// Validate command structure
				if (!command || !command.data || !command.execute) {
					logger.error(`Invalid command structure in file: ${f}`);
					throw new Error(`Invalid command file: ${f}`);
				}

				// Handle subcommands vs main commands
				if (command.parent !== null && command.parent !== undefined) {
					logger.debug(
						`Adding subcommand: ${command.data.name} to parent: ${command.parent}`
					);
					subCommandsArray.push(command as SubCommand);
					client.subCommands.set(
						`${command.parent}.${command.data.name}`,
						<SubCommand>command
					);
					logger.debug(`Registered subcommand: ${command.parent}.${command.data.name}`);
				} else {
					logger.debug(`Adding main command: ${command.data.name}`);
					client.commands.set(command.data.name, command as BaseCommand);
					commandsArray.push(command);
					logger.debug(`Registered main command: ${command.data.name}`);
				}

				// Add command status to the table
				table.addRow(
					command.parent ? `${command.parent}.${command.data.name}` : command.data.name,
					'🟩'
				);
			} catch (error) {
				logger.error({ file: f, error }, 'Error loading command');
				const commandName = f.split('/')[f.split('/').length - 1].split('.')[0];
				logger.debug(`Failed to load command ${commandName} from path: ${f}`);
				table.addRow(commandName, '🟥');
				throw error;
			}
		});

		logger.debug(
			`Loaded ${commandsArray.length} main commands and ${subCommandsArray.length} subcommands`
		);

		// Attach subcommands to their parent commands
		logger.debug('Attaching subcommands to parent commands...');
		subCommandsArray.forEach((command) => {
			const parentCommand = client.commands
				.filter((cmd) => cmd.data.name === command.parent)
				.first();

			if (!parentCommand) {
				logger.warn(`Parent command not found for subcommand: ${command.data.name}`);
				return;
			}

			logger.debug(`Attaching subcommand ${command.data.name} to parent ${command.parent}`);
			parentCommand.data.addSubcommand(command.data as SlashCommandSubcommandBuilder);
		});

		// Prepare command data for Discord API
		logger.debug('Preparing command data for Discord API...');
		const commandData: ApplicationCommandDataResolvable[] = [];

		commandsArray.forEach((cmd) => {
			const data = (cmd.data as any).toJSON();
			commandData.push(data);
			logger.debug(`Prepared command data for: ${cmd.data.name}`);
		});

		// Register commands with Discord
		logger.debug(`Registering ${commandData.length} commands with Discord API...`);
		await client.application?.commands.set(commandData);
		logger.debug('Successfully registered commands with Discord API');

		// Display command loading results
		logger.info('\n' + table.toString());
		logger.info(
			`Commands Loaded - Total: ${commandsArray.length} main commands, ${subCommandsArray.length} subcommands`
		);
	} catch (error) {
		logger.error({ error }, 'Error in loadCommands');
		throw error;
	}
}
