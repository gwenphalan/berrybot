import { SlashCommandSubcommandBuilder, type ApplicationCommandDataResolvable } from 'discord.js';
import type { Command, SubCommand } from '@/core/interfaces/Command';
import type { Client } from '@/core/client/BerryClient';
import { BaseCommand } from '@/core/interfaces/Command';
import { load } from '@/core/utils/Files';
import { logger } from '@/core/logging/Logger';
import AsciiTable from 'ascii-table';
import { localeManager } from '@/core/managers/LocaleManager';
import { config } from '@/core/config/config';

// Main function to load and register all commands with Discord
export async function loadCommands(client: Client) {
	const table = new AsciiTable().setHeading('Commands', 'Status');

	// Ensure locales are loaded before loading commands
	await localeManager.loadLocales();

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
		for (const f of files) {
			try {
				const commandName = f.split('/')[f.split('/').length - 1].split('.')[0];
				logger.debug(`Processing command file: ${commandName}`);

				const imported = await import(f);
				const command: Command = imported.default || imported;
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
		}

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

		// Prepare command data
		const isDev = (process.env.NODE_ENV || '').toLowerCase() === 'development';
		const testGuildId = config.testing_server_id;

		// Separate dev-only and public commands
		const devCommands: Command[] = [];
		const publicCommands: Command[] = [];
		for (const cmd of commandsArray) {
			if ((cmd as any).developer) {
				devCommands.push(cmd);
			} else {
				publicCommands.push(cmd);
			}
		}

		// Prepare command data
		const devCommandData: ApplicationCommandDataResolvable[] = devCommands.map((cmd) =>
			(cmd.data as any).toJSON()
		);
		const publicCommandData: ApplicationCommandDataResolvable[] = publicCommands.map((cmd) =>
			(cmd.data as any).toJSON()
		);

		if (isDev) {
			// In dev mode, register all commands (dev and public) as guild commands in the test guild
			logger.info(
				`[CommandHandler] Registering ALL commands as GUILD commands for guild: ${testGuildId}`
			);
			await client.application?.commands.set(
				[...publicCommandData, ...devCommandData],
				testGuildId
			);
		} else {
			// In production, register public commands globally, dev commands only in the test guild
			if (publicCommandData.length > 0) {
				logger.info('[CommandHandler] Registering PUBLIC commands as GLOBAL commands');
				await client.application?.commands.set(publicCommandData);
			}
			if (devCommandData.length > 0 && testGuildId) {
				logger.info(
					`[CommandHandler] Registering DEV-ONLY commands as GUILD commands for guild: ${testGuildId}`
				);
				await client.application?.commands.set(devCommandData, testGuildId);
			}
		}

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
