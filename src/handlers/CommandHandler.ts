import { ApplicationCommandDataResolvable } from "discord.js";
import { Client } from "../interfaces/Client";
import { Command } from "../interfaces/command";
import { loadFiles } from "../util/fileLoader";


export async function loadCommands(client: Client) {
    const ascii = require("ascii-table");
    const table = new ascii().setHeading("Commands", "Status");

    await client.commands.clear();

    let commandsArray: ApplicationCommandDataResolvable[] = [];

    const files = await loadFiles("commands");

    files.forEach((f) => {
        const command: Command = require(f);
        client.commands.set(command.data.name, command);

        commandsArray.push(command.data.toJSON());

        table.addRow(command.data.name, "🟩");
    });

    client.application?.commands.set(commandsArray);

    return console.log(table.toString(), "\nCommands Loaded.");
}