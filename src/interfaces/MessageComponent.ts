import * as discord from 'discord.js';
import { Client } from './';

/**
 * Union type for all possible component interactions
 * Represents the different types of interactions that can be handled
 */
type ComponentInteraction =
	| discord.ButtonInteraction
	| discord.StringSelectMenuInteraction
	| discord.ModalSubmitInteraction;

/**
 * Enum defining the types of message components
 * Used to identify and handle different component types
 */
export enum ComponentTypes {
	Button = 'BUTTON',
	SelectMenu = 'SELECT_MENU',
	Modal = 'MODAL',
}

/**
 * Base interface for all message components
 * Defines common properties and methods shared by all component types
 */
export interface BaseMessageComponent {
	/** Unique identifier for the component */
	id: string;
	/**
	 * @deprecated Implied by the component type.
	 * Type of the component (Button, SelectMenu, or Modal)
	 */
	type: ComponentTypes;
	/** Whether the select menu allows multiple selections (only for select menus) */
	multi_select?: boolean;
	/** Required permissions to use this component */
	permissions?: bigint[];
	/** Whether this component is restricted to developers only */
	developer?: boolean;
	/**
	 * Handles the component interaction
	 * @param interaction - The interaction object from Discord
	 * @param client - The bot client instance
	 * @param data - Optional data passed to the component
	 * @param guild - Optional guild where the interaction occurred
	 * @param response - Optional modal response data
	 * @param selected - Optional selected options for select menus
	 */
	execute(
		interaction: ComponentInteraction,
		client: Client,
		data?: { [key: string]: any },
		guild?: discord.Guild,
		response?: discord.Collection<string, discord.TextInputComponent>,
		selected?: discord.APISelectMenuOption | discord.APISelectMenuOption[]
	): void;
	/**
	 * Builds the component for Discord
	 * @param client - The bot client instance
	 * @param args - Additional arguments for component construction
	 * @returns Promise resolving to the built component
	 */
	build(
		client: Client,
		...args: any
	):
		| Promise<discord.ButtonBuilder>
		| Promise<discord.SelectMenuBuilder>
		| Promise<discord.ModalBuilder>;
}

/**
 * Interface for button components
 * Extends the base component with button-specific properties and methods
 */
export interface ButtonComponent extends Omit<BaseMessageComponent, 'multi_select'> {
	/** Type is always Button for button components */
	type: ComponentTypes.Button;
	/**
	 * Handles button interactions
	 * @param interaction - The button interaction object
	 * @param client - The bot client instance
	 * @param data - Optional data passed to the button
	 * @param guild - Optional guild where the interaction occurred
	 */
	execute(
		interaction: discord.ButtonInteraction,
		client: Client,
		data?: { [key: string]: any },
		guild?: discord.Guild
	): void;
	/**
	 * Builds the button component
	 * @param client - The bot client instance
	 * @param args - Additional arguments for button construction
	 * @returns Promise resolving to the built button
	 */
	build(client: Client, ...args: any): Promise<discord.ButtonBuilder>;
}

/**
 * Interface for single-select menu components
 * Extends the base component with single-select specific properties and methods
 */
export interface SingleSelectMenuComponent
	extends Omit<BaseMessageComponent, 'execute' | 'multi_select'> {
	/** Type is always SelectMenu for select menu components */
	type: ComponentTypes.SelectMenu;
	/** Always false for single-select menus */
	multi_select?: false;
	/**
	 * Handles single-select menu interactions
	 * @param interaction - The select menu interaction object
	 * @param client - The bot client instance
	 * @param selected - The selected option
	 * @param data - Optional data passed to the select menu
	 * @param guild - Optional guild where the interaction occurred
	 */
	execute(
		interaction: discord.SelectMenuInteraction,
		client: Client,
		selected: discord.APISelectMenuOption,
		data?: { [key: string]: any },
		guild?: discord.Guild
	): void;
	/**
	 * Builds the select menu component
	 * @param client - The bot client instance
	 * @param args - Additional arguments for select menu construction
	 * @returns Promise resolving to the built select menu
	 */
	build(client: Client, ...args: any): Promise<discord.SelectMenuBuilder>;
}

/**
 * Interface for multi-select menu components
 * Extends the base component with multi-select specific properties and methods
 */
export interface MultiSelectMenuComponent extends Omit<BaseMessageComponent, 'execute'> {
	/** Type is always SelectMenu for select menu components */
	type: ComponentTypes.SelectMenu;
	/** Always true for multi-select menus */
	multi_select: true;
	/**
	 * Handles multi-select menu interactions
	 * @param interaction - The select menu interaction object
	 * @param client - The bot client instance
	 * @param selected - Array of selected options
	 * @param data - Optional data passed to the select menu
	 * @param guild - Optional guild where the interaction occurred
	 */
	execute(
		interaction: discord.SelectMenuInteraction,
		client: Client,
		selected: discord.APISelectMenuOption[],
		data?: { [key: string]: any },
		guild?: discord.Guild
	): void;
	/**
	 * Builds the select menu component
	 * @param client - The bot client instance
	 * @param args - Additional arguments for select menu construction
	 * @returns Promise resolving to the built select menu
	 */
	build(client: Client, ...args: any): Promise<discord.SelectMenuBuilder>;
}

/** Union type for all select menu components */
export type SelectMenuComponent = SingleSelectMenuComponent | MultiSelectMenuComponent;

/**
 * Interface for modal components
 * Extends the base component with modal-specific properties and methods
 */
export interface ModalComponent extends Omit<BaseMessageComponent, 'execute' | 'multi_select'> {
	/** Unique identifier for the modal */
	id: string;
	/** Type is always Modal for modal components */
	type: ComponentTypes.Modal;
	/**
	 * Handles modal submit interactions
	 * @param interaction - The modal submit interaction object
	 * @param client - The bot client instance
	 * @param response - Collection of text input components and their values
	 * @param data - Optional data passed to the modal
	 * @param guild - Optional guild where the interaction occurred
	 */
	execute(
		interaction: discord.ModalSubmitInteraction,
		client: Client,
		response: discord.Collection<string, discord.TextInputComponent>,
		data?: { [key: string]: any },
		guild?: discord.Guild
	): void;
	/**
	 * Builds the modal component
	 * @param client - The bot client instance
	 * @param args - Additional arguments for modal construction
	 * @returns Promise resolving to the built modal
	 */
	build(client: Client, ...args: any): Promise<discord.ModalBuilder>;
}

/** Union type for all message components */
export type MessageComponent = ButtonComponent | SelectMenuComponent | ModalComponent;
