/**
 * Interface for Discord event handlers
 * Defines the structure for both regular and REST API events
 */
export type Event = {
	/** The name of the Discord event to listen for (e.g., 'messageCreate', 'interactionCreate') */
	name: string;
	/** Whether the event should only be handled once (true) or multiple times (false/undefined) */
	once?: boolean;
	/** Whether this is a REST API event (true) or a regular Discord client event (false/undefined) */
	rest?: boolean;
	/**
	 * Event handler function that processes the event
	 * @param args - Variable arguments passed by Discord.js for the specific event
	 * @example
	 * // For a message event:
	 * execute(message: Message) { ... }
	 * // For an interaction event:
	 * execute(interaction: Interaction) { ... }
	 */
	execute(...args: any[]): void;
};
