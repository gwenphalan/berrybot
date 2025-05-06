# BerryBot TODOs

> This file is a living document. Please keep it concise and up to date.

## Table of Contents

- [BerryBot TODOs](#berrybot-todos)
    - [Table of Contents](#table-of-contents)
- [General TODOs](#general-todos)
- [Bot Features Road Map](#bot-features-road-map)
    - [1. Core Architecture and Extensibility](#1-core-architecture-and-extensibility)
    - [2. Advanced Administration Utilities](#2-advanced-administration-utilities)
    - [3. Moderation \& Logging](#3-moderation--logging)
    - [4. Community Feedback](#4-community-feedback)
    - [5. User Experience \& Engagement](#5-user-experience--engagement)
    - [6. Utility \& Information](#6-utility--information)
    - [7. Entertainment \& Games](#7-entertainment--games)
- [Core Road Map](#core-road-map)
    - [1. Command System Improvements](#1-command-system-improvements)
        - [1.1 Add Command Localization Support](#11-add-command-localization-support)
    - [2. Enhance Option Validation](#2-enhance-option-validation)
    - [3. Implement Autocomplete Support](#3-implement-autocomplete-support)
    - [4. Update Component Implementation](#4-update-component-implementation)
        - [5.1 Component Interface Modernization](#51-component-interface-modernization)
        - [5.2 Enhanced Custom ID System](#52-enhanced-custom-id-system)
        - [5.3 Component Utilities](#53-component-utilities)
        - [5.4 Component Management](#54-component-management)
    - [6. Simplify Flow System](#6-simplify-flow-system)
    - [7. Improve Light Flow and Flow architecture](#7-improve-light-flow-and-flow-architecture)
    - [8. Enhance Message Template System](#8-enhance-message-template-system)
        - [8.1 Message Builder Interface](#81-message-builder-interface)
        - [8.2 Template Management](#82-template-management)
        - [8.3 Template Utilities](#83-template-utilities)
        - [8.4 Template Factory](#84-template-factory)
- [Codebase Improvements](#codebase-improvements)
    - [1. Code Quality Enhancements](#1-code-quality-enhancements)
- [Reference \& Implementation Details](#reference--implementation-details)
    - [Command System](#command-system)
        - [Localization](#localization)
        - [Validation](#validation)
        - [Autocomplete](#autocomplete)
    - [Component Implementation](#component-implementation)
        - [Component Interface Modernization](#component-interface-modernization)
        - [Enhanced Custom ID System](#enhanced-custom-id-system)
        - [Component Utilities](#component-utilities)
        - [Component Management](#component-management)
    - [Flow System](#flow-system)
        - [LightFlow and Flow Simplification](#lightflow-and-flow-simplification)
        - [Flow Architecture Improvements](#flow-architecture-improvements)
    - [Message Template System](#message-template-system)
        - [Message Builder Interface](#message-builder-interface)
        - [Template Management](#template-management)
        - [Template Utilities](#template-utilities)
        - [Template Factory](#template-factory)

This document outlines key improvements to bring BerryBot up to date with the latest Discord.js best practices and features.

---

# General TODOs

- [x] Refactor: Project Restructure

    - [x] Review and reorganize project directory structure for clarity and scalability
    - [x] Consolidate duplicate or legacy folders (e.g., merge dist/src if possible)
    - [x] Standardize naming conventions for all folders and files
    - [x] Move all type/interface definitions to a dedicated types/ or interfaces/ directory
    - [x] Ensure all config, util, and handler files are in their respective folders
    - [x] Update import paths throughout the codebase to match new structure
    - [x] Update documentation to reflect new project layout

    **Recommended Folder Structure:**

    ```
    src/
      core/
        bot.ts                # Main bot startup logic
        index.ts              # Entrypoint (could be in root if preferred)
        sharding.ts           # Sharding logic
        BerryClient.ts        # Your extended Discord.js Client class
        FlowManager.ts        # Core flow management
        CommandManager.ts     # Core command loading/registration
        EventManager.ts       # Core event loading/registration
        ComponentManager.ts   # Core component loading/registration
        Logger.ts             # Logging utility
        config.ts             # Centralized config
        database.ts           # DB connection/init
        types.ts              # Core types/interfaces (or a subfolder)
        utils.ts              # Core utilities (or a subfolder)
      commands/
        Public/
        Private/
        ...
      components/
        buttons/
        modals/
        selectMenus/
        ...
      events/
        Client/
        Interactions/
        ...
      flows/
        roles/
        ...
      database/
        schemas/
        ...
      interfaces/             # (Optional: for extension-specific interfaces)
      types/                  # (Optional: for extension-specific types)
      util/                   # (Optional: for extension-specific utilities)
      config/                 # (Optional: for extension-specific config)
      messages/
      ...
    ```

- [x] Refactor: Upgrade bot core to support components v2

    - [x] Audit all usages of message components (buttons, select menus, modals)
    - [x] Review and update custom ID parsing and validation logic for new component structure
    - [x] Ensure all select menus and modals use the latest builder APIs and features (e.g., default_values)
    - [x] Update or add TypeScript types/interfaces for any new component types or data
    - [x] Test and validate all component flows (manual and automated)
    - [x] Update documentation and code comments to reflect new component APIs and patterns
    - [x] Remove any deprecated helpers/utilities related to old component APIs

- [ ] Finish porting self-roles feature to new Flow architecture
    - [ ] Create `category-edit` page and corresponding message components
        - [ ] `name`, `emoji`, `roles`, `delete` buttons
        - [ ] `delete-confirm` modal
        - [ ] `category-edit` message template
        - [ ] `emoji-select` message template + `emoji` button functionality
    - [ ] Finish `RolenfigFlow.ts`

# Bot Features Road Map

## 1. Core Architecture and Extensibility

- [ ] Implement a Plugin Loader

    - Scan a /dist/plugins/ directory at startup and dynamically register each plugins commands, event hooks, message components, message templates, and flows.
    - Add hot-reloading so new plugins can be added or updated without restarting the bot.

- [ ] Create a plugin template CLI
    - add a `yarn create:plugin <name>` script that scaffolds a new plugin folder with `commands/`, `events/`, `components/`, `messages/`, `flows/` and a `README.md`
    - Document plugin conventions in docs/ and update CONTRIBUTING.md accordingly.

## 2. Advanced Administration Utilities

- [ ] Time-limited & Hierarchical Self-Roles

    - Extend the existing self-role component to accept an optional duration paramter
    - Support role groups where users choose exactly one role from a category via a select-menu with multi_select: false

- [ ] New plugin: "Channel Spawner"

    - Automatically create new voice channels when an existing one reaches capacity, based on a template channel.
    - Prune empty auto-spawned channels after configurable idle timeout, using Day.js for scheduling.

- [ ] Scheduled Announcements & Reminders
    - Build a /schedule slash command with modal input for date/time (ISO string) and message content.
    - Store schedules in MongoDB; use a cron scheduler (e.g. node-cron) to send reminders or announcements at the right time.

## 3. Moderation & Logging

- [ ] Member Screening Flow

    - Implement a welcome DM or modal-based screening (questions stored in a new MemberScreening schema).
    - On approval, assign a "Verified" role; on failure, auto-kick.

- [ ] Mute, Ban, Kick Commands

    - Add /mute, /ban, /kick commands with optional duration and reason.
    - Log each action to a designated channel using an Event Logger plugin (new Mongo schema for logs).

- [ ] Support Ticket System
    - Create private ticket channels via command or message button
    - Automatically manage channel permissions so only staff + requester can view.
    - Add /ticket close or message button to archive or delete the channel.

## 4. Community Feedback

- [ ] Suggestions & Polls Plugin
    - /suggest command posts to a #suggestions channel with upvote/downvote buttons; track counts in MongoDB.
    - Auto-approve suggestions that reach a threshold within 7 days.
    - Add /poll create for multi-choice polls with buttons, results tallied in real-time.

## 5. User Experience & Engagement

- [ ] Custom Welcome Messages

    - Create configurable welcome messages with variables like {user}, {server}, {memberCount}, etc.
    - Support for welcome images with customizable templates using Canvas
    - Add welcome DM option with server information and getting started guide

- [ ] Server Stats Display

    - Create auto-updating voice channels that display member count, bot count, online users, etc.
    - Add dashboard commands to view server activity metrics and growth charts
    - Implement weekly server stats summary posts

- [ ] User Profiles & Reputation System
    - Add user profile cards with customizable backgrounds and badges
    - Implement a reputation/karma system with thank/rep commands
    - Create leaderboards for server activity and reputation

## 6. Utility & Information

- [ ] Enhanced Server Information

    - Create rich /serverinfo command with detailed statistics and visual elements
    - Add role hierarchy visualization and permission analysis tools
    - Implement channel activity analytics with most active channels and peak times

- [ ] Multi-platform Integrations

    - Add support for connecting to Twitch for stream notifications
    - Implement GitHub webhook handling for repository events
    - Create Twitter/X integration for tweet notifications

- [ ] FAQ Knowledge Base System
    - Allow server admins to create custom FAQ entries with rich content
    - Support for categorized FAQ topics with autocomplete search functionality
    - Add variables and conditional responses based on user roles or channel

## 7. Entertainment & Games

- [ ] Mini-games Suite

    - Implement text-based adventure games with buttons for navigation
    - Add trivia game with categories and difficulty levels
    - Create multiplayer games like Tic-tac-toe, Connect Four, and Hangman

- [ ] Economy & Currency System

    - Implement virtual currency with daily rewards and activity-based earnings
    - Add shop system for roles or custom profile features
    - Create gambling mini-games with leaderboards

- [ ] Media Integration

    - Add music player with playlist support and voting system
    - Implement image manipulation commands for memes and fun effects
    - Create GIF search and favoriting system

- [ ] Soundboard
    - Create customizable sound collections that users can trigger in voice channels
    - Implement server-specific sound libraries with upload/management capabilities
    - Add command based sound triggering and cooldown management

---

# Core Road Map

## 1. Command System Improvements

- [ ] Enforce strict, consistent command interface signatures (always require both interaction and client)
- [ ] Implement a global error handler for commands, with user-facing error replies and detailed logging
- [ ] Add a Validators.ts utility and use Discord.js option validation features (setMinLength, setMaxLength, etc.) [See details: [Validation](#validation)]
- [ ] Implement localization for commands (names, descriptions, options) [See details: [Localization](#localization)]
- [ ] Add support for autocomplete handlers for relevant options [See details: [Autocomplete](#autocomplete)]
- [ ] Add optional metadata (usage, examples, category) to the command interface for help/auto-docs
- [ ] Document the command system and add tests for command logic
- [ ] Consider a plugin/feature-based command organization for scalability
- [ ] Add a command reload/hot-reload feature for development
- [ ] Ensure all command handlers are async and properly await all promises
- [ ] Update docs/commands.md to reflect new best practices and patterns

### 1.1 Add Command Localization Support

Discord.js now supports command and option name/description localization, making your bot more accessible to international users.

- [ ] See [1. Command System Improvements](#1-command-system-improvements) and [Localization](#localization) in the Reference & Implementation Details section.

## 2. Enhance Option Validation

Add more robust option validation to improve user experience and prevent errors.

- [ ] See [1. Command System Improvements](#1-command-system-improvements) and [Validation](#validation) in the Reference & Implementation Details section.

## 3. Implement Autocomplete Support

Add autocomplete functionality to provide dynamic suggestions as users type command options.

- [ ] See [1. Command System Improvements](#1-command-system-improvements) and [Autocomplete](#autocomplete) in the Reference & Implementation Details section.

## 4. Update Component Implementation

Enhance the component system to better leverage Discord.js capabilities.

### 5.1 Component Interface Modernization

- [x] Add support for all select menu types and modal components
- [x] Enhance component event handling with proper typing
    - [x] Add support for all interaction types
    - [x] Implement typed data extraction from custom IDs
    - [x] Create proper error handling for component interactions
- [x] Implement better builder patterns for components
    - [x] Add fluent interface for component creation
    - [x] Create standardized component styling
    - [x] Support disabled states, emoji, and other visual options

### 5.2 Enhanced Custom ID System

- [ ] Implement type-safe data extraction from customIds
    - [ ] Create generic `getCustomIDData<T>` utility
    - [ ] Add validation for extracted data
    - [ ] Implement error handling for malformed data
- [ ] Improve data compression for component data
    - [ ] Optimize JSON serialization/deserialization
    - [ ] Add support for complex data structures
    - [ ] Implement data validation during compression
- [ ] Create standardized customId format
    - [ ] Support hierarchical component IDs
    - [ ] Add versioning for backward compatibility
    - [ ] Implement consistent naming conventions

### 5.3 Component Utilities

- [ ] Create a ComponentUtils class with helper methods
    - [ ] Add `createConfirmationButtons()` utility
    - [ ] Implement `createPaginationRow()` for navigation
    - [ ] Create `buildSelectMenuOptions()` for dynamic options
- [ ] Implement reusable component patterns
    - [ ] Add confirmation dialog components
    - [ ] Create pagination components with page tracking
    - [ ] Implement form components with validation
- [ ] Create components for common interaction patterns
    - [ ] Add role selection components
    - [ ] Implement multi-step form components
    - [ ] Create navigation component systems

### 5.4 Component Management

- [x] Create a dedicated ComponentManager class
- [x] Implement component registration system
- [x] Add typed component retrieval methods
- [x] Create component validation during registration
- [x] Enhance component loading and organization
- [x] Implement dynamic component loading by category
- [x] Improve component error handling
    - [x] Implement standardized error responses
    - [x] Add component interaction timeout handling
    - [x] Create component debugging utilities

## 6. Simplify Flow System

While powerful, the current flow system may be overly complex for simple use cases.

- [ ] Create a simplified "LightFlow" version for basic interactions [See details: [Flow System](#flow-system)]
- [ ] Add examples of common flow patterns for quick implementation
- [ ] Improve flow state management with type-safe interfaces
- [ ] Create utility functions for common flow operations
- [ ] Provide documentation for choosing between full and light flow systems

## 7. Improve Light Flow and Flow architecture

- [ ] Add support for ephemeral flows [See details: [Flow System](#flow-system)]
- [ ] Create dynamic message and component templates that can be reused across multiple flows
- [ ] Implement flow composition and nesting
- [ ] Improve flow testing and debugging tools
- [ ] Add persistent storage options for long-running flows

## 8. Enhance Message Template System

### 8.1 Message Builder Interface

- [ ] Update message builder interfaces to support Discord.js v14+ components
    - [ ] Add generic type support for message data parsing
    - [ ] Update method signatures for better type safety
    - [ ] Create specialized interfaces for new message types
- [ ] Enhance message event handling with proper typing
    - [ ] Add support for all interaction types
    - [ ] Implement typed data extraction from custom IDs
    - [ ] Create proper error handling for message interactions
- [ ] Implement better builder patterns for messages
    - [ ] Add fluent interface for message creation
    - [ ] Create standardized message styling
    - [ ] Support disabled states, emoji, and other visual options

### 8.2 Template Management

- [ ] Create a TemplateManager class with helper methods
    - [ ] Add `createMessageTemplate()` utility
    - [ ] Implement `createMessageTemplate()` for dynamic message creation
    - [ ] Create `buildMessageTemplateOptions()` for dynamic message customization
- [ ] Implement reusable message patterns
    - [ ] Add message template components
    - [ ] Create message template factories
    - [ ] Implement message template validation
- [ ] Create templates for common interaction patterns
    - [ ] Add message template components
    - [ ] Implement message template builders
    - [ ] Create message template utilities

### 8.3 Template Utilities

- [ ] Create a TemplateUtils class with helper methods
    - [ ] Add `createMessageTemplate()` utility
    - [ ] Implement `createMessageTemplate()` for dynamic message creation
    - [ ] Create `buildMessageTemplateOptions()` for dynamic message customization
- [ ] Implement reusable message patterns
    - [ ] Add message template components
    - [ ] Create message template factories
    - [ ] Implement message template validation
- [ ] Create templates for common interaction patterns
    - [ ] Add message template components
    - [ ] Implement message template builders
    - [ ] Create message template utilities

### 8.4 Template Factory

- [ ] Create a TemplateFactory class with helper methods
    - [ ] Add `createMessageTemplate()` utility
    - [ ] Implement `createMessageTemplate()` for dynamic message creation
    - [ ] Create `buildMessageTemplateOptions()` for dynamic message customization
- [ ] Implement reusable message patterns
    - [ ] Add message template components
    - [ ] Create message template factories
    - [ ] Implement message template validation
- [ ] Create templates for common interaction patterns
    - [ ] Add message template components
    - [ ] Implement message template builders
    - [ ] Create message template utilities

---

# Codebase Improvements

This section focuses on technical improvements, optimizations, and code quality enhancements that don't necessarily add new features but improve the overall codebase.

## 1. Code Quality Enhancements

- [ ] Implement consistent error handling patterns
    - Create standardized error classes in `src/util/errors/`:
        - `BotError`: Base error class with error codes and structured data
        - `CommandError`: For command execution failures
        - `ValidationError`: For input validation failures
        - `

# Reference \& Implementation Details

## Command System

### Localization

Discord.js now supports command and option name/description localization, making your bot more accessible to international users.

- Implement `setNameLocalizations()` and `setDescriptionLocalizations()` in command builders
    - Create locale resources for supported languages:
        - Add `src/locales/` directory with JSON files (`en.json`, `de.json`, `fr.json`, etc.)
        - Structure locale files with nested objects (`commands.ping.name`, `commands.ping.description`)
        - Support at least 5 major languages (English, German, French, Spanish, Japanese)
    - Extend the existing command system to support localization:
        - Create `LocalizedSlashCommandBuilder` class extending Discord.js SlashCommandBuilder
        - Add `setLocalizedName()` and `setLocalizedDescription()` methods
        - Implement backward compatibility with non-localized commands
    - Integrate with the current command registration in `src/handlers/CommandHandler.ts`:
        - Modify command loading to detect and apply localizations
        - Update command registration to include localization data
        - Ensure compatibility with existing subcommand system
- Add localization support for option names and descriptions
    - Maintain compatibility with the existing Command interface structure:
        - Extend `src/interfaces/Command.ts` to support localized options
        - Add localization support to BaseCommand and SubCommand interfaces
    - Support localization for all option types:
        - Create helper methods (`addLocalizedStringOption()`, `addLocalizedIntegerOption()`, etc.)
        - Implement option builders that handle localization automatically
        - Support choice localization for options with predefined choices
    - Preserve existing validation and option handling:
        - Ensure localization doesn't break validation logic
        - Maintain compatibility with current option parsers
        - Update command execution handlers to work with localized commands
- Create a centralized locale management system
    - Implement within the existing utility structure:
        - Create `src/util/Locale.ts` with `LocaleManager` class
        - Add locale loading/caching system
        - Implement translation helper functions (`t()`, `localize()`)
    - Support fallback logic when translations are missing:
        - Implement fallback chain (user locale → server locale → default locale)
        - Create placeholder generation for missing translations
        - Add logging for missing translations to aid development
    - Add configuration options for enabled locales:
        - Update `src/config/index.ts` with locale settings
        - Create toggles for enabling/disabling specific languages
        - Add locale detection and negotiation system
- Add documentation for localization in command system documentation
    - Update existing documentation to include localization best practices:
        - Add "Localization" section to `docs/commands.md`
        - Document locale file format and structure
        - Provide guidelines for writing effective localized text
    - Provide examples that match the current command implementation pattern:
        - Add example of fully localized command with options
        - Include code snippets for common localization patterns
        - Show how to test localized commands

Example implementation:

```typescript
.setName('dog')
.setNameLocalizations({
  pl: 'pies',
  de: 'hund',
})
.setDescription('Get a cute picture of a dog!')
.setDescriptionLocalizations({
  pl: 'Słodkie zdjęcie pieska!',
  de: 'Poste ein niedliches Hundebild!',
})
```

### Validation

Add more robust option validation to improve user experience and prevent errors.

- Implement string validation with `setMinLength()` and `setMaxLength()`
    - Integrate these methods into existing string option handling
    - Ensure compatibility with current command structure
    - Add support for common string validation patterns:
        - Username formats (3-32 characters, no special characters except hyphens/underscores)
        - Tag patterns (alphanumeric with hashtag format)
        - Server-specific IDs and format rules
        - Basic URL validation for links and references
- Add numeric validation with `setMinValue()` and `setMaxValue()`
    - Apply to both Integer and Number option types
    - Support range validation for commonly used numeric parameters:
        - Count/amount limits (1-100 for pagination, etc.)
        - Duration bounds (min 1 second, max 1 week for scheduled events)
        - Percentage values (0-100)
        - Server-specific numeric limits
    - Ensure appropriate error handling for out-of-range values
        - Create `src/util/ValidationError.ts` for standardized error responses
        - Implement user-friendly error messages with suggested valid ranges
- Include channel type restrictions with `addChannelTypes()`
    - Filter available channels based on command requirements
    - Support multiple channel types using the ChannelType enum:
        ```typescript
        // Example types to support
        ChannelType.GuildText;
        ChannelType.GuildVoice;
        ChannelType.GuildForum;
        ChannelType.GuildAnnouncement;
        ```
    - Integrate with permission systems for proper channel access
- Update command documentation with examples of advanced validation
    - Document best practices for different option types
    - Include examples that fit with your command implementation pattern
    - Update validation sections in existing documentation
- Create utility functions to standardize validation across commands
    - Build helper functions in `src/util/Validators.ts`:
        - `validateUsername(input: string): boolean`
        - `validateNumericRange(value: number, min: number, max: number): boolean`
        - `validateChannelAccess(channel: Channel, member: GuildMember): boolean`
        - `validateUrlSafety(url: string): Promise<boolean>`
    - Implement custom validators for project-specific needs
    - Ensure consistency across all command implementations by creating a validation layer

Example implementation:

```typescript
.addStringOption(option =>
  option.setName('input')
    .setDescription('The input to validate')
    .setMinLength(3)
    .setMaxLength(100)
)
.addIntegerOption(option =>
  option.setName('count')
    .setDescription('A number to validate')
    .setMinValue(1)
    .setMaxValue(10)
)
.addChannelOption(option =>
  option.setName('channel')
    .setDescription('The channel to use')
    .addChannelTypes(ChannelType.GuildText)
)
```

### Autocomplete

Add autocomplete functionality to provide dynamic suggestions as users type command options.

- Create autocomplete handler system
    - Extend the current `SlashCommands.ts` interaction handler to support autocomplete interactions:
        - Add autocomplete detection in the main interaction handler
        - Create a dedicated `AutocompleteHandler` class in `src/handlers/AutocompleteHandler.ts`
        - Add autocomplete routing logic to direct requests to appropriate handlers
    - Integrate with the existing event system architecture:
        - Register autocomplete events using the existing event registration pattern
        - Ensure proper event propagation for autocomplete interactions
        - Add autocomplete-specific event types to type definitions
    - Implement proper interaction type checking for autocomplete requests:
        - Add safeguards against handling non-autocomplete interactions
        - Create TypeScript type guards for autocomplete interactions
        - Add error handling specific to autocomplete failures
- Implement autocomplete for relevant command options
    - Update command interface to support autocomplete option configuration:
        - Extend `src/interfaces/Command.ts` with autocomplete handler definitions
        - Add `AutocompleteOption` interface with required methods
        - Create helper methods for defining autocomplete sources
    - Add support for both static and dynamic suggestion lists:
        - Static lists: Predefined options that don't change frequently
        - Dynamic lists: Database-driven options that update in real-time
        - Hybrid lists: Combination of static and filtered dynamic suggestions
    - Ensure compatibility with the existing command system:
        - Create backward compatibility for commands without autocomplete
        - Provide fallback behavior for autocomplete failures
        - Optimize for performance with potentially large option lists
- Add documentation for autocomplete implementation
    - Document the autocomplete workflow and architecture in `docs/commands.md`
    - Provide examples that follow your command implementation pattern:
        - Simple static list example
        - Database query example
        - Combination of multiple data sources example
    - Include best practices for performance with large datasets:
        - Client-side filtering strategies
        - Query optimization techniques
        - Caching implementations for frequently accessed data
- Create reusable autocomplete functions for common data types
    - Develop utility functions in `src/util/Autocomplete.ts`:
        - `createStaticAutocomplete(choices: Array<{name: string, value: string}>)`
        - `createDatabaseAutocomplete(queryFn: (input: string) => Promise<Array<{name: string, value: string}>>)`
        - `createCachedAutocomplete(source: AutocompleteSource, ttl?: number)`
        - `fuzzyMatchAutocomplete(input: string, choices: string[])`
    - Build database integration for dynamic suggestions:
        - Create optimized query patterns for different database types
        - Implement query builders for common autocomplete patterns
        - Add query result transformation utilities
    - Implement caching mechanisms for frequently requested suggestions:
        - Add in-memory LRU cache for frequently accessed suggestions
        - Create tiered caching strategy (memory → persistent)
        - Add cache invalidation triggers for data updates

Example implementation:

```typescript
// In command definition:
.addStringOption(option =>
  option.setName('query')
    .setDescription('Search for something')
    .setAutocomplete(true)
)

// In AutocompleteHandler:
export class ExampleAutocompleteHandler implements AutocompleteHandler {
  constructor(private db: Database) {}

  async handle(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused().toString();

    if (focusedValue.length < 2) {
      return interaction.respond([
        { name: 'Type at least 2 characters...', value: 'placeholder' }
      ]);
    }

    const results = await this.db.search(
      'items',
      { name: { $regex: focusedValue, $options: 'i' } },
      { limit: 25 }
    );

    return interaction.respond(
      results.map(item => ({ name: item.name, value: item.id }))
    );
  }
}
```

## Component Implementation

### Component Interface Modernization

Update component interfaces to support Discord.js v14+ components and improve type safety.

- Modernize component interfaces with proper typing
    - Update `MessageComponent.ts` interfaces with generics:
        ```typescript
        export interface ButtonComponent<T extends Record<string, any> = Record<string, any>>
        	extends Omit<BaseMessageComponent, 'multi_select'> {
        	id: string;
        	type: ComponentTypes.Button;
        	permissions?: bigint[];
        	developer?: boolean;
        	execute(
        		interaction: ButtonInteraction,
        		client: Client,
        		data?: T,
        		guild?: Guild
        	): Promise<void> | void;
        	build(
        		client: Client,
        		options?: {
        			style?: ButtonStyle;
        			emoji?: string | APIMessageComponentEmoji;
        			label?: string;
        			disabled?: boolean;
        			url?: string;
        			data?: T;
        		}
        	): Promise<ButtonBuilder>;
        }
        ```
    - Add support for all select menu types and modal components:
        - `StringSelectMenuComponent`: For string select menus
        - `UserSelectMenuComponent`: For user select menus
        - `RoleSelectMenuComponent`: For role select menus
        - `ChannelSelectMenuComponent`: For channel select menus
        - `MentionableSelectMenuComponent`: For mentionable select menus
    - Update modal component interface with better form handling:
        ```typescript
        export interface ModalComponent<T extends Record<string, any> = Record<string, any>>
        	extends Omit<BaseMessageComponent, 'execute' | 'multi_select'> {
        	id: string;
        	type: ComponentTypes.Modal;
        	execute(
        		interaction: ModalSubmitInteraction,
        		client: Client,
        		response: Collection<string, TextInputComponentData>,
        		data?: T,
        		guild?: Guild
        	): Promise<void> | void;
        	build(
        		client: Client,
        		options?: {
        			title: string;
        			components: TextInputComponentOptions[];
        			data?: T;
        		}
        	): Promise<ModalBuilder>;
        }
        ```
    - Create new interfaces for component data:
        - Add `ComponentData` interface for standard properties
        - Implement `SelectMenuOptionData` for option data
        - Create `ModalComponentData` for form field data
- Update component event handling
    - Enhance the interaction handler in `src/events/Interactions/MessageComponent.ts`:
        - Add proper interaction type checking with TypeScript guards
        - Improve interaction routing based on component type
        - Implement consistent error handling for different component types
    - Add support for all component interaction types:
        - Update handling for all select menu types
        - Add proper modal submission handling
        - Implement button interaction handling with better context
    - Create component event hooks for common patterns:
        - Add `beforeInteraction` and `afterInteraction` hooks
        - Implement rate limiting for component interactions
        - Create permission-based interaction filtering
- Implement improved builder patterns
    - Create fluent builder patterns for components:
        ```typescript
        // Example button builder
        const button = new ButtonBuilder()
        	.setId('action:delete')
        	.setStyle(ButtonStyle.Danger)
        	.setLabel('Delete')
        	.setEmoji('🗑️')
        	.setDisabled(false)
        	.withData({ itemId: '123' });
        ```
    - Implement component factories for common patterns:
        - Create `ButtonFactory` with predefined styles (primary, danger, etc.)
        - Implement `SelectMenuFactory` with option builders
        - Add `ModalFactory` with form field templates
    - Add component styling utilities:
        - Implement consistent color schemes for buttons
        - Create standard labeling patterns
        - Add icon/emoji consistency helpers

### Enhanced Custom ID System

Improve the custom ID system for better type safety, validation, and data handling.

- Implement typed data extraction system
    - Create a generic data extraction utility:
        ```typescript
        export class ComponentDataExtractor {
        	static extract<T extends Record<string, any>>(
        		customId: string
        	): { id: string; parent?: string; group?: string; data?: T } {
        		// Implementation
        	}
        }
        ```
    - Add schema validation for extracted data:
        - Implement validation against predefined schemas
        - Add type guards for data structures
        - Create error handling for invalid data
    - Improve error recovery for malformed data:
        - Add fallback values for missing properties
        - Implement data sanitization
        - Create logging for data extraction failures
- Optimize data compression for component data
    - Enhance the existing compression system:
        - Implement more efficient serialization for common data types
        - Add dictionary-based compression for repeated patterns
        - Create binary encoding for complex data structures
    - Add support for complex data types:
        - Implement special handling for dates and timestamps
        - Add array compression optimizations
        - Create nested object handling with path compression
    - Implement data validation during compression:
        - Add size limit checks before compression
        - Create fallback mechanisms for oversized data
        - Implement warning system for approaching limits
- Create standardized customId format
    - Implement hierarchical component identifiers:
        ```
        domain:group:action[data]
        ```
        - Domain: Feature area or plugin (e.g., "roles", "tickets")
        - Group: Component group or context (e.g., "config", "selection")
        - Action: Specific action (e.g., "add", "remove", "edit")
        - Data: Optional compressed JSON data
    - Add versioning for backward compatibility:
        - Implement version prefixes for component IDs
        - Create migration utilities for old formats
        - Add compatibility layer for legacy components
    - Standardize naming conventions:
        - Create style guide for component IDs
        - Implement validation for ID formats
        - Add documentation generator for component IDs

### Component Utilities

Create utility classes and functions to standardize component creation and interaction handling.

- Implement ComponentUtils utility class
    - Create confirmation button utilities:
        ```typescript
        export class ComponentUtils {
        	// Create a standard confirmation button row
        	static createConfirmationButtons(
        		baseId: string,
        		data?: Record<string, any>,
        		options?: {
        			confirmLabel?: string;
        			cancelLabel?: string;
        			confirmStyle?: ButtonStyle;
        			cancelStyle?: ButtonStyle;
        			confirmEmoji?: string;
        			cancelEmoji?: string;
        		}
        	): ActionRowBuilder<ButtonBuilder> {
        		// Implementation
        	}
        }
        ```
    - Add pagination utilities:
        ```typescript
        static createPaginationRow(
          baseId: string,
          currentPage: number,
          totalPages: number,
          data?: Record<string, any>
        ): ActionRowBuilder<ButtonBuilder> {
          // Implementation with prev/next/first/last buttons
        }
        ```
    - Implement select menu option builders:
        ```typescript
        static createSelectMenuOptions<T>(
          items: T[],
          config: {
            labelProperty: keyof T | ((item: T) => string);
            valueProperty: keyof T | ((item: T) => string);
            descriptionProperty?: keyof T | ((item: T) => string);
            emojiProperty?: keyof T | ((item: T) => string | APIMessageComponentEmoji);
            defaultSelected?: (item: T) => boolean;
          }
        ): APISelectMenuOption[] {
          // Implementation
        }
        ```
- Create reusable component patterns
    - Implement standard confirmation dialogs:
        ```typescript
        export class ConfirmationDialog {
        	static async create(
        		interaction: CommandInteraction | MessageComponentInteraction,
        		options: {
        			title: string;
        			description: string;
        			confirmLabel?: string;
        			cancelLabel?: string;
        			onConfirm: (i: ButtonInteraction) => Promise<void>;
        			onCancel?: (i: ButtonInteraction) => Promise<void>;
        			ephemeral?: boolean;
        			timeout?: number;
        		}
        	): Promise<void> {
        		// Implementation
        	}
        }
        ```
    - Add pagination components:
        - Create `Paginator` class for list pagination
        - Implement `GridView` for tiled content display
        - Add `Carousel` for cycling through content
    - Build form components with validation:
        - Implement `FormBuilder` with field validation
        - Create `WizardForm` for multi-step forms
        - Add `ModalForm` for input collection
- Implement common interaction patterns
    - Create role selection components:
        ```typescript
        export class RoleSelector {
        	static async create(
        		interaction: CommandInteraction,
        		options: {
        			roles: Collection<string, Role> | Role[];
        			multiple?: boolean;
        			placeholder?: string;
        			onSelect: (roles: Role | Role[], i: SelectMenuInteraction) => Promise<void>;
        		}
        	): Promise<void> {
        		// Implementation
        	}
        }
        ```
    - Add multi-step component flows:
        - Create standardized navigation between component states
        - Implement data collection across multiple interactions
        - Add progress indicators for multi-step flows
    - Implement common UI patterns:
        - Create dropdown menus with subcategories
        - Add expandable/collapsible sections
        - Implement tabbed interfaces with buttons

### Component Management

Create a dedicated component management system for better organization and type safety.

- Create ComponentManager class

    - Implement component registration system:

        ```typescript
        export class ComponentManager {
        	private readonly components = new Collection<string, BaseMessageComponent>();
        	private readonly client: Client;

        	constructor(client: Client) {
        		this.client = client;
        	}

        	register<T extends BaseMessageComponent>(component: T): void {
        		const key = `${component.id}:${component.type.toLowerCase()}`;
        		this.components.set(key, component);
        	}

        	get<T extends BaseMessageComponent>(id: string, type: ComponentTypes): T | undefined {
        		const key = `${id}:${type.toLowerCase()}`;
        		return this.components.get(key) as T | undefined;
        	}

        	createCustomId<T extends Record<string, any>>(
        		id: string,
        		data?: T,
        		schema?: Record<string, any>
        	): string {
        		// Implementation with validation
        	}
        }
        ```

    - Add type-safe component retrieval:
        - Implement generic methods for component access
        - Create type guards for component types
        - Add component existence validation
    - Implement component validation during registration:
        - Validate component structure and required methods
        - Check permissions and configuration
        - Ensure component ID uniqueness

- Enhance component loading system
    - Create dynamic component loader:
        ```typescript
        export class ComponentLoader {
        	static async loadComponents(
        		client: Client,
        		directories: string[] = ['buttons', 'selectMenus', 'modals']
        	): Promise<number> {
        		// Implementation
        	}
        }
        ```
    - Implement component categorization:
        - Organize components by feature area
        - Create component tagging system
        - Add component metadata for documentation
    - Add component dependency management:
        - Implement component dependencies resolution
        - Create component initialization order
        - Add component relationship tracking
- Improve component error handling
    - Create standardized error responses:
        ```typescript
        export class ComponentErrorHandler {
        	static async handleError(
        		interaction: MessageComponentInteraction | ModalSubmitInteraction,
        		error: Error,
        		component?: BaseMessageComponent
        	): Promise<void> {
        		// Implementation with user-friendly messages
        	}
        }
        ```
    - Add interaction timeout handling:
        - Implement automatic interaction acknowledgment
        - Create deferred response handling
        - Add timeout recovery mechanisms
    - Implement component debugging tools:
        - Create component testing utilities
        - Add component state inspection tools
        - Implement component performance monitoring

## Flow System

### LightFlow and Flow Simplification

While powerful, the current flow system may be overly complex for simple use cases.

- Create a simplified "LightFlow" version for basic interactions
    - Develop a streamlined version of BaseFlowHandler:
        - Create `src/interfaces/LightFlow.ts` extending BaseFlowHandler from `src/interfaces/Flow.ts`
        - Reduce required override methods to minimal set
        - Implement smart defaults for common configuration options
    - Create a simplified state management system:
        - Add `SimpleState` class with reduced properties
        - Implement auto-expiring states with configurable TTL
        - Create state persistence that requires minimal configuration
    - Implement automatic interaction response handling:
        - Add default acknowledgment responses
        - Create auto-deferring for long operations
        - Implement automatic error responses with customization hooks
    - Maintain compatibility with existing flow registration system:
        - Ensure LightFlow works with current FlowManager
        - Add type compatibility with existing flow interfaces
        - Create migration utilities for converting between flow types
- Add examples of common flow patterns for quick implementation
    - Create reusable templates in `src/flows/templates/`:
        - `ConfirmationFlow.ts`: Simple yes/no decision with callback
        - `FormFlow.ts`: Multi-step data collection with validation
        - `SelectionFlow.ts`: Option selection with confirmation
        - `PaginatedFlow.ts`: Content browsing with page navigation
    - Develop patterns for multi-step form flows:
        - Create form state validation helpers
        - Implement step skipping based on conditions
        - Add back/forward navigation with state preservation
    - Implement wizard-style navigation flows:
        - Add progress indicators for multi-step flows
        - Create branching logic based on previous selections
        - Implement completion handlers with collected data
- Improve flow state management with type-safe interfaces
    - Add generics to FlowState:
        ```typescript
        // Example of generic FlowState
        export class FlowState<T extends Record<string, any> = Record<string, any>> {
        	public readonly data: T;
        	// Other properties
        }
        ```
    - Create helper types for common state structures:
        - `FormState<T>` for handling multi-step forms
        - `SelectionState<T>` for option selection flows
        - `PaginatedState<T>` for paginated content
    - Implement runtime type checking:
        - Add schema-based validation for state transitions
        - Create transition guards with typed parameters
        - Implement error handling for type violations
- Create utility functions for common flow operations
    - Build helper functions in `src/util/FlowUtils.ts`:
        - `transitionTo<T>(flow: BaseFlow, state: string, data: T): Promise<void>`
        - `mergeState<T>(currentState: FlowState<T>, newData: Partial<T>): FlowState<T>`
        - `createStateSnapshot<T>(flow: BaseFlow<T>): StateSnapshot<T>`
    - Implement common permission and validation checks:
        - `ensureFlowPermission(interaction: Interaction, permissions: PermissionResolvable[])`
        - `validateFlowState<T>(state: FlowState<T>, schema: ValidationSchema): ValidationResult`
        - `assertUserInFlow(userId: string, flow: BaseFlow): boolean`
    - Create utilities for persistent state management:
        - Add database integration for flow state persistence
        - Implement state recovery mechanisms for interrupted flows
        - Create state migration tools for version changes
- Provide documentation for choosing between full and light flow systems
    - Document use cases for each flow system in `docs/flows.md`:
        - When to use full flow (complex state, many steps, custom logic)
        - When to use light flow (simple interactions, few states, standard patterns)
        - Decision matrix for flow type selection
    - Create migration guidelines between systems:
        - Step-by-step guide for converting between flow types
        - Compatibility layer for mixed flow environments
        - Testing strategies for flow migrations
    - Include decision flowcharts for flow selection:
        - Visual decision tree for flow type selection
        - Complexity assessment guidelines
        - Performance considerations based on interaction patterns

Example implementation:

```typescript
// LightFlow example with simplified API
import { LightFlow, FlowState } from '../flows/LightFlow';
import { ButtonBuilder, ActionRowBuilder } from 'discord.js';

// Define state type for type safety
interface PollState {
	question: string;
	options: string[];
	votes: Record<string, number>;
	voters: string[];
}

export class SimplePollFlow extends LightFlow<PollState> {
	// Simplified configuration with defaults
	config = {
		id: 'simple-poll',
		timeout: 1 * 60 * 60 * 1000, // 1 hour
		states: ['display', 'results'],
	};

	// Simplified state builder
	async buildState(state: 'display' | 'results', interaction: Interaction) {
		switch (state) {
			case 'display':
				const options = this.data.options.map((option, index) => {
					return new ButtonBuilder()
						.setCustomId(`vote:${index}`)
						.setLabel(option)
						.setStyle('Primary');
				});

				const rows = this.createRows(options);

				return {
					content: `📊 **Poll:** ${this.data.question}`,
					components: rows,
					ephemeral: false,
				};

			case 'results':
				const results = this.data.options
					.map((option, index) => {
						const votes = this.data.votes[index] || 0;
						const percentage =
							this.data.voters.length > 0
								? Math.round((votes / this.data.voters.length) * 100)
								: 0;

						return `${option}: ${votes} votes (${percentage}%)`;
					})
					.join('\n');

				return {
					content: `📊 **Poll Results:** ${this.data.question}\n\n${results}`,
					components: [],
					ephemeral: false,
				};
		}
	}

	// Simple handler for votes
	async handleButton(interaction) {
		const [action, index] = interaction.customId.split(':');
		const userId = interaction.user.id;

		if (action === 'vote' && !this.data.voters.includes(userId)) {
			// Update vote count
			const voteIndex = parseInt(index);
			this.data.votes[voteIndex] = (this.data.votes[voteIndex] || 0) + 1;
			this.data.voters.push(userId);

			// Save state
			await this.updateState();

			// Acknowledge the vote
			return interaction.reply({
				content: `You voted for "${this.data.options[voteIndex]}"!`,
				ephemeral: true,
			});
		}
	}

	// Helper to create action rows from buttons
	private createRows(buttons: ButtonBuilder[]) {
		const rows = [];
		for (let i = 0; i < buttons.length; i += 5) {
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				buttons.slice(i, i + 5)
			);
			rows.push(row);
		}
		return rows;
	}
}
```

### Flow Architecture Improvements

- Add support for ephemeral flows

    - Implement ephemeral message handling in flow system:
        - Add `ephemeral` flag to flow configuration options
        - Create utility methods for toggling ephemeral status during flow execution
        - Ensure proper cleanup of ephemeral messages when flows complete
    - Enhance interaction privacy management:
        - Add user-specific session tracking for ephemeral flows
        - Implement proper permission checks for ephemeral message interactions
        - Create safeguards against ephemeral message timeouts
    - Optimize performance for ephemeral interactions:
        - Minimize state storage requirements for ephemeral flows
        - Implement efficient cleanup mechanisms for expired flows
        - Add monitoring for ephemeral flow usage and performance

- Create dynamic message and component templates that can be reused across multiple flows

    - Develop a template system for consistent UI elements:
        - Create `src/templates/MessageTemplates.ts` with standard message layouts
        - Implement `src/templates/ComponentTemplates.ts` for reusable component structures
        - Add theming support for consistent visual styling across templates
    - Build configurable templates with data binding:
        - Implement template parameter substitution for dynamic content
        - Create conditional display logic within templates
        - Add support for localized templates with translation integration
    - Create specialized templates for common interaction patterns:
        - Implement confirmation dialog templates with standardized buttons
        - Create form templates with validation support
        - Build list/grid templates for data presentation
        - Add pagination templates for large datasets

- Implement flow composition and nesting

    - Create system for combining multiple flows:
        - Develop parent-child flow relationship architecture
        - Implement flow transition handling between nested flows
        - Add context passing between parent and child flows
    - Implement flow inheritance patterns:
        - Create base flow templates that can be extended
        - Develop mixins for common flow behaviors
        - Implement method overriding with super() access
    - Add flow orchestration capabilities:
        - Create `FlowOrchestrator` class to manage flow sequences
        - Implement parallel flow execution for complex interactions
        - Add flow dependency resolution system

- Improve flow testing and debugging tools

    - Create specialized testing utilities:
        - Implement `FlowTester` class for simulating user interactions
        - Add snapshot testing for flow states and transitions
        - Create mock interaction generators for automated testing
    - Enhance flow debugging experience:
        - Add detailed flow state logging and visualization
        - Implement step-by-step flow execution for troubleshooting
        - Create replay capability for reproducing flow issues
    - Build flow analytics system:
        - Add performance metrics collection for flow execution
        - Implement user engagement tracking for flows
        - Create dashboards for flow usage statistics

- Add persistent storage options for long-running flows
    - Implement database integration for flow persistence:
        - Create serialization/deserialization for flow states
        - Add TTL (time-to-live) options for stored flows
        - Implement automatic flow state recovery on bot restart
    - Add user session management:
        - Create user-specific flow resumption capabilities
        - Implement automatic flow state saving and restoration
        - Add flow timeout notifications and recovery options
    - Enhance flow data security:
        - Implement data encryption for sensitive flow state information
        - Add permission-based access control for stored flows
        - Create data minimization strategies for flow storage

Example implementation:

```typescript
// Dynamic message template system
import { TemplateEngine } from '../util/TemplateEngine';

// Define a reusable confirmation template
export class ConfirmationTemplate {
	static build(options: {
		title: string;
		description: string;
		confirmLabel?: string;
		cancelLabel?: string;
		data?: Record<string, any>;
	}) {
		const {
			title,
			description,
			confirmLabel = 'Confirm',
			cancelLabel = 'Cancel',
			data,
		} = options;

		// Create standardized components
		const buttons = ComponentTemplates.createConfirmationButtons({
			confirmId: 'confirm',
			cancelId: 'cancel',
			confirmLabel,
			cancelLabel,
			data,
		});

		// Build the complete message with embeds
		return {
			embeds: [
				{
					title,
					description,
					color: ColorPalette.PRIMARY,
				},
			],
			components: [buttons],
			ephemeral: true,
		};
	}
}

// Using the template in a flow
export class AccountDeletionFlow extends LightFlow<{ userId: string }> {
	// Flow configuration
	config = {
		id: 'account-deletion',
		ephemeral: true, // Make all messages in this flow ephemeral
		states: ['confirm', 'processing', 'complete'],
	};

	// Build the confirmation state
	async buildConfirmState(interaction: Interaction) {
		return ConfirmationTemplate.build({
			title: 'Delete Account',
			description:
				'Are you sure you want to delete your account? This action cannot be undone.',
			confirmLabel: 'Delete Account',
			cancelLabel: 'Keep Account',
			data: { userId: this.data.userId },
		});
	}

	// Handle the confirmation
	async handleConfirmButton(interaction: ButtonInteraction, action: string) {
		if (action === 'confirm') {
			await this.transitionTo('processing');
			// Process account deletion
			await this.database.users.delete(this.data.userId);
			return this.transitionTo('complete');
		} else {
			// Cancel the flow
			return this.end();
		}
	}
}
```

## Message Template System

### Message Builder Interface

- [ ] Update message builder interfaces to support Discord.js v14+ components
    - [ ] Add generic type support for message data parsing
    - [ ] Update method signatures for better type safety
    - [ ] Create specialized interfaces for new message types
- [ ] Enhance message event handling with proper typing
    - [ ] Add support for all interaction types
    - [ ] Implement typed data extraction from custom IDs
    - [ ] Create proper error handling for message interactions
- [ ] Implement better builder patterns for messages
    - [ ] Add fluent interface for message creation
    - [ ] Create standardized message styling
    - [ ] Support disabled states, emoji, and other visual options

### Template Management

- [ ] Create a TemplateManager class with helper methods
    - [ ] Add `createMessageTemplate()` utility
    - [ ] Implement `createMessageTemplate()` for dynamic message creation
    - [ ] Create `buildMessageTemplateOptions()` for dynamic message customization
- [ ] Implement reusable message patterns
    - [ ] Add message template components
    - [ ] Create message template factories
    - [ ] Implement message template validation
- [ ] Create templates for common interaction patterns
    - [ ] Add message template components
    - [ ] Implement message template builders
    - [ ] Create message template utilities

### Template Utilities

- [ ] Create a TemplateUtils class with helper methods
    - [ ] Add `createMessageTemplate()` utility
    - [ ] Implement `createMessageTemplate()` for dynamic message creation
    - [ ] Create `buildMessageTemplateOptions()` for dynamic message customization
- [ ] Implement reusable message patterns
    - [ ] Add message template components
    - [ ] Create message template factories
    - [ ] Implement message template validation
- [ ] Create templates for common interaction patterns
    - [ ] Add message template components
    - [ ] Implement message template builders
    - [ ] Create message template utilities

### Template Factory

- [ ] Create a TemplateFactory class with helper methods
    - [ ] Add `createMessageTemplate()` utility
    - [ ] Implement `createMessageTemplate()` for dynamic message creation
    - [ ] Create `buildMessageTemplateOptions()` for dynamic message customization
- [ ] Implement reusable message patterns
    - [ ] Add message template components
    - [ ] Create message template factories
    - [ ] Implement message template validation
- [ ] Create templates for common interaction patterns
    - [ ] Add message template components
    - [ ] Implement message template builders
    - [ ] Create message template utilities
