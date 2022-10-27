import { Client } from "../interfaces/Client";
import { Event } from "../interfaces/event";
import { loadFiles } from '../util/fileLoader';
 
export const loadEvents = async (client: Client) => {
    const ascii = require("ascii-table");
    const table = new ascii().setHeading("Events", "Status");

    await client.events.clear();

    const Files = await loadFiles("events");

    Files.forEach((file) => {
        const event: Event = require(file).event;

        const execute = (...args: any[]) => event.execute(...args, client);
        client.events.set(event.name, execute);

        if(event.rest) {
            if(event.once) client.rest.on(event.name, execute);
            else 
            client.rest.on(event.name, execute);
        } else {
            if(event.once) client.once(event.name, execute);
            else client.on(event.name, execute);
        }

        table.addRow(event.name, "🟩");
    })

    return console.log(table.toString(), "\nLoaded Events")
}