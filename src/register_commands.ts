// Import packages
import { REST, Routes } from 'discord.js';
import { config } from '../config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Command } from './interfaces/command';

interface CommandData {
    name: string;
    description: string;
}

const commands: CommandData[] = [];
const commandsPath = path.join(__dirname, 'commands');


const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command: Command = require(`${commandsPath}/${file}`);
    commands.push(command.data.toJSON());
}


const rest = new REST({ version: '10' }).setToken(config.token);


(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationCommands(config.client_id),
            { body: commands },
        );

        console.log(`Successfully reloaded ${(<any>data).length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
