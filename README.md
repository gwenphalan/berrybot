![Logo](https://cdn.unimatrix-01.dev/images/berrybot/github_banner.png)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Discord](https://img.shields.io/discord/1034695813026283580?color=%235865F2&label=Discord&logo=Discord)](https://discord.gg/9kJMfBGFrh)
![Version](https://img.shields.io/badge/version-0.0.1-ff69b4)
[![Github Repo](https://img.shields.io/badge/-Github%20Repo-informational?logo=github&style=flat&logoColor=333333&color=333333&labelColor=999999)](https://github.com/gwenphalan/berrybot)

---

# About

BerryBot is an Open Source discord bot created to replace the corrupt discord bots that have monopolized discord. Too many bots have been created that are designed to milk its users out of as much revenue as possible. BerryBot is designed to be transparent in its data usage and free-to-use forever. There is a berrybot/base branch with a barebones setup for those who want to create their own bots.

---

### Table of Contents
- [About](#about)
- [Features](#features)
  - [Added Features](#added-features)
  - [Planned Features](#planned-features)
  - [Project Structure](#project-structure)
  - [Setup and Installation](#setup-and-installation)
    - [Prerequisites](#prerequisites)
    - [Environment Variables](#environment-variables)
    - [Installation](#installation)
  - [Core Components](#core-components)
    - [Commands](#commands)
    - [Message Builders](#message-builders)
    - [Message Components](#message-components)
      - [Persistent Component Data](#persistent-component-data)
      - [Buttons](#buttons)
      - [Select Menus](#select-menus)
      - [Modals](#modals)
    - [Adding a New Component](#adding-a-new-component)
    - [MongoDB Database](#mongodb-database)
      - [Creating a new Schema](#creating-a-new-schema)
  - [Adding New Features](#adding-new-features)
    - [Adding a New Command](#adding-a-new-command)
  - [Development Guidelines](#development-guidelines)
    - [Handlers](#handlers)
      - [Command Handler](#command-handler)
      - [Event Handler](#event-handler)
      - [Message Component Handler](#message-component-handler)
    - [Logging](#logging)
  - [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
      - [MongoDB Connection Issues](#mongodb-connection-issues)
      - [Command Registration Issues](#command-registration-issues)
      - [Component Interaction Issues](#component-interaction-issues)
  - [License](#license)
- [Authors](#authors)

---

# Features

## Added Features

-   Administration

    -   Self Roles
        -   Allow users to assign themselves roles in different categories.

## Planned Features

-   Moderation

    -   Member Screening
        -   Require users to fill out a form before being allowed access to the server.
    -   Mute, Ban, and Kick Commands
        -   Punish users for breaking server rules and terms of service, either permanently or temporarily.
    -   Support Tickets
        -   Allow users to create support tickets and speak directly to server staff about an issue.
    -   Event Logging

        -   Log all bot moderation events to a specific channel, to easily detect permission abuse by moderators.

-   Administration

    -   Member Welcoming
        -   Send personlized welcome messages to new users.

---

## Project Structure
```
src/
├── commands/           # Bot commands
│   ├── Public/        # Public commands
│   └── Private/       # Private/developer commands
├── components/        # Message components (buttons, select menus, etc.)
├── config/           # Configuration files
├── database/         # Database models and connection
├── events/           # Discord event handlers
├── handlers/         # Command and event loading handlers
├── interfaces/       # TypeScript interfaces and types
├── messages/         # Message templates
├── util/            # Utility functions
├── bot.ts           # Bot initialization
└── index.ts         # Entry point
```

---

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Discord Bot Token

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
DISCORD_TOKEN=your_discord_bot_token
MONGO_STRING=your_mongodb_connection_string
DATABASE_NAME=your_database_name
DEVELOPER_ID=your_discord_user_id
NODE_ENV=development | production
```

### Installation
1. Clone the repository
2. Install dependencies:
```bash
yarn install
```
3. Build the project:
```bash
yarn build
```
4. Start the bot:
```bash
// For development
yarn dev

// For production
yarn start
```

---

## Core Components

---

### Commands
Each command is a TypeScript module that exports a command object. The bot's command handler will scan `/dist/commands` for `.js` files, and register them automatically, so it is unnecessary to import your commands manually. 

When a `ChatInputCommandInteraction` event is sent to the bot, it will search it's registry for the command, and run it's `execute()` function.

Example command structure:
```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../../interfaces';
import { logger } from '../../util':

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Test command')
        .setDefaultMemberPermissions(0), // Can only be used in a server
    async execute(interaction: ChatInputCommandInteraction) {
        return await interaction.reply('Test command executed!');
    }
};

module.exports = command;
```

If you want to add subcommands to a command (ex `/command subCommand`), you must replace `data` with a `SlashCommandSubCommandBuilder`. They also have the required property `parent`.

Example subcommand structure:
```typescript
import { ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { buttons } from '../../../components';
import { Command } from '../../../interfaces';

const command: Command = {
    parent: 'test',
    data: new SlashCommandSubcommandBuilder()
        .setName('button')
        .setDescription('Test button'),
    async execute(interaction: ChatInputCommandInteraction, client) {
        // Return if the interaction wasn't used in a guild.
        if (!interaction.guild) {
            return await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
        }

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(await buttons.TestButton.build(client));

        return await interaction.reply({ content: 'Test Button', components: [row] });
    }
};

module.exports = command;
```

---

### Message Builders
Message builders are reusable templates for Discord messages that can include embeds, components, and other message options. They are useful for creating consistent message layouts across different commands.

1. Create a new file in `src/messages/` with the following structure:
```typescript
import { MessageBuilder } from '../../interfaces';
import { Client } from '../../interfaces/Client';

export const WelcomeMessage: MessageBuilder = {
    embeds: [], // Array of embeds to include
    components: [], // Array of action rows with components
    
    // Build function that returns the final message options
    async build(client: Client, username: string) {
        return {
            embeds: [
                {
                    title: `Welcome ${username}!`,
                    description: 'Thanks for joining our server!',
                    color: 0x00ff00
                }
            ],
            components: [
                // Add your components here
            ]
        };
    }
};
```

2. Use the message builder in your commands:
```typescript
import { WelcomeMessage } from '../../messages';

// In your command
const message = await WelcomeMessage.build(client, interaction.user.username);
await interaction.reply(message);
```

---

### Message Components

If you want to utilize message components for interactivity, it is unecessary to script each one from the command file. Rather there is a system for reusable components in `/src/components/`. This allows for reuse of scripted components across multiple commands, and keeps your command files from getting too long.

Message components have following properties:
```typescript
{
    id: string; // Unique ID for this component. (EX: 'role-selector')
    permissions?: bigint[]; // Permission Bits required to interact with this component
    multi_select?: boolean; // [SELECT MENU ONLY] Toggle Multi Select
    developer?: boolean; // Developer only
    execute(
        interaction: ComponentInteraction, // Interaction object
        client: Client, // Bot client
        data?: { [key: string]: any }, // Any data parsed from the components unique ID
        guild?: discord.Guild, // Guild the component is in
        response?: discord.Collection<string, discord.TextInputComponent>, // [MODAL ONLY] Values entered into Text Inputs
        selected?: discord.APISelectMenuOption | discord.APISelectMenuOption[] // [SELECT MENU ONLY] Menu items selected
    ): void;
    build(client: Client, ...args: any): Promise<discord.ComponentBuilder>; // Any code and arguments needed to build the component.
}
```

Example component structure:
```typescript
import { ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { ButtonComponent  } from '../../interfaces/MessageComponent';

// Example button component that requires certain permissions to use
export const MessageComponent: ButtonComponent = {
    id: 'test-button',
    type: ComponentTypes.Button,
    // User needs ManageEvents and ManageRoles permissions
    permissions: [PermissionFlagsBits.ManageEvents, PermissionFlagsBits.ManageRoles],
    
    async build(client, boolean) {
        return new ButtonBuilder()
            .setCustomId(await client.getCustomID('test-button', testJSON))
            .setLabel('Test Button')
            .setStyle(ButtonStyle.Primary);
    },

    // Handles the button click
    execute(
        interaction,
        _client
    ) {
        interaction.reply({
            content: `You pressed the test button!`,
            ephemeral: true
        });
    }
};

export default MessageComponent;
```

#### Persistent Component Data
In some cases it is useful to store extra data in a component. To do this, utilize the `client.getCustomID(id, jsonObject)`. This function utilizes the `LZ-String` library to compress the stringified JSON object into a compact, URI-safe string. This compressed string is then embedded within a Discord component's custom ID, allowing the storage of additional data without exceeding Discord's character limits for component identifiers. (100 haracter limit) 

Note: As this data is stored on discord, it is recommended not to store sensitive data.

Example Json:
```TypeScript
const modal_data = {
    type:    "modal",
    id:      "mod_history",
    userId:  "123456789012345678",
    page:    2,
    filters: {
        sort:     "recent", 
        category: "moderation",
        tags:     ["bans", "kicks", "mutes"],
        priority: "high",
        resolved: false
    },
};

const button_id = await client.getCustomID('open-history', modal_data);
 //console.log(button_id) => open-history[ᯡࠫ䅜Ā匰ᜨאỠጢణㄠ㑀আ䆅栯倢恠材⠤炯ࠢ巉你䦃ࠨ怩䀹䀥䀵䀭䀽䀣䀳䀡䁄≬獈డ暑爛瀣ᠲ挡浡ᑕ͐ጔ〣ಀǹ々壬㇁䧂⩔ຎѰ໬ね⧜;∠ɐ恚丐öɻʜ㤥䲊〥氁∈ș䠲ᔦ䊹䎁㋠ǘ悘竸瘠⿃⠠]
```
*Tip: Avoid including "dynamic" data, like user provided text or anything that isn't predictable.*



#### Buttons
Buttons are defined in `src/components/buttons/`. They are the only component that does not have any unique properties or arguments.

> [!NOTE]
> An example button is seen at the start of this [section](#message-components). 


#### Select Menus
Select menus are defined in `src/components/selectMenus/`. The property `multi_select` can be set to `true` to toggle multi-select. The argument `seleted` passed through `execute` is a `discord.APISelectMenuOption`. If multi select is enabled, it is passed as an array.

Example select menu structure:
```typescript
import { StringSelectMenuBuilder } from 'discord.js';
import { SelectMenuComponent } from '../../interfaces';

export const TestSelect: SelectMenuComponent = {
    customId: 'test-select',
    multi_select: false,
    build: async (client) => {
        return new StringSelectMenuBuilder()
            .setCustomId('test-select')
            .setPlaceholder('Select an option')
            .addOptions([
                { label: 'Option 1', value: '1' },
                { label: 'Option 2', value: '2' }
            ]);
    },
    execute: async (interaction, _client, selected) => {
        // Reply to the interaction with the selected option's label
        interaction.reply({ content: `You selected ${selected.label}`, ephemeral: true });
    }
};
```

#### Modals
Modals are defined in `src/components/modals/`. They are used to collect one or more text inputs. `execute()` passes the responses as the argument `response`, a `Collection<string, discord.TextInputComponent>`. (The key is the customId you gave the TextInputBuilder)

Example modal structure:
```typescript
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ModalComponent, ComponentTypes } from '../../interfaces/MessageComponent';
import { logger } from '../../util';

export const MessageComponent: ModalComponent = {
    id: 'test-modal',
    async build(_client) {
        const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder().setCustomId('test-modal-input').setPlaceholder('Test Input').setStyle(TextInputStyle.Short).setLabel('Test Input')
        );
        return new ModalBuilder().setTitle('Test Modal').setCustomId('test-modal').setComponents([row]);
    },

    async execute(interaction, _client, fields) {
        logger.info(
            '\n' + new (require('ascii-table'))().setHeading('Field', 'Response').addRow('test-modal-input', fields.get('test-modal-input')?.value).toString()
        );

        // Reply to the interaction with the response.
        interaction.reply({ content: `This is a test modal! You said: ${fields.get('test-modal-input')?.value}`, ephemeral: true });
    }
};

export default MessageComponent;

```
### Adding a New Component
1. Choose the appropriate component type (Button, Select Menu, or Modal)
2. Create a new file in the corresponding directory:
   - `src/components/buttons/` for buttons
   - `src/components/selectMenus/` for select menus
   - `src/components/modals/` for modals
3. Follow the component interface structure.
4. Import and register the component in `src/components/index.ts` for easy access.
```typescript
import { TestButton } from './buttons/TestButton';
import { TestSelect } from './selectMenus/TestSelect';
import { TestModal } from './modals/TestModal';

export const components = {
    buttons: {
        TestButton
    },
    selectMenus: {
        TestSelect
    },
    modals: {
        TestModal
    }
};
```

Example Usage:
```typescript
import buttons from '../components/';

const row = new ActionRowBuilder().addComponents(button);

const message = {
    components: [row]
}
```

---

### MongoDB Database
This bot optionally uses MongoDB for data storage. To use this you'll need to create a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account.

#### Creating a new Schema

1. Create a new `.ts` file in src/database/schemas with the following structure:
```typescript
import mongoose from 'mongoose';

// TypeScript interface for MongoDB documents - includes all fields and Mongoose methods
export interface ExampleModel extends mongoose.Document {
    document_id: number;
    string: string;
    number: number;
    boolean: boolean;
    object: ExampleObject;
}

// Example interface for nested object structure.
export interface ExampleObject {
    string: string;
    number: number;
    boolean: boolean;
}

// Mongoose schema defines document structure and validation rules. Note this does not use traditional typings, thus the need to be manually outlined.
const ExampleSchema = new mongoose.Schema({
    document_id: Number,
    string: String,
    number: Number,
    boolean: Boolean,
    object: {
        string: String,
        number: Number,
        boolean: Boolean
    }
});

// Creates Mongoose model with TypeScript type safety
export const ExampleModel = mongoose.model<ExampleModel>('ExampleSchema', ExampleSchema);
```
2. In `src/database/index.ts`, import your database model:
```typescript
import mongoose from 'mongoose';
import { config } from '../config';
import { ExampleModel } from './schemas/Example'; // Imported Model

...
```
3. Create a `Model` object with the following properties and functions:
```typescript
export const example: Model = {
    // Function used to retrieve documents, and create a new one if it is not found.
    get: async (document_id: string) =>
        (await ExampleModel.findOne({ document_id: document_id })) ||
        (await ExampleModel.create({
            document_id: document_id
            // Add any default values here
        })),
    update: async(document_id: string, data: ExampleModel) {
        await GuildSettings.updateOne({ document_id: document_id }, settings);
    }
    model: ExampleModel
};
```

4. Add your model to the `database` object at the end of the file. This object is accessible from the bot `client` object. (Ex: `client.database.serverSettings.get(guildId))`)
```typescript
export const database = {
    modReports,
    userProfiles,
    example
    // Add models here
};

### Events
Events are handled in the `events/` directory. Each event is a TypeScript module that exports an event object.

Example event structure:
```typescript
import { Event } from '../../interfaces';

export const event: Event = {
    name: 'eventName',
    once: true,
    execute: async (client) => {
        // Event handling logic
    }
};
```

---

## Adding New Features

### Adding a New Command
1. Create a new file in `src/commands/Public/` or `src/commands/Private/`
2. Follow the command structure template
3. The command will be automatically loaded by the command handler 

## Development Guidelines

### Handlers
The bot uses three main handlers to manage its components:

#### Command Handler
Located in `src/handlers/CommandHandler.ts`, this handler:
- Loads all commands from the `commands/` directory
- Registers slash commands with Discord
- Handles command execution
- Supports both public and private commands
- Automatically loads subcommands

#### Event Handler
Located in `src/handlers/EventHandler.ts`, this handler:
- Loads all events from the `events/` directory
- Registers event listeners with Discord.js
- Supports both once and regular event listeners
- Handles event execution with proper error catching

#### Message Component Handler
Located in `src/handlers/MessageComponentHandler.ts`, this handler:
- Loads all message components (buttons, select menus, modals) from the `components/` directory
- Registers component interactions
- Handles component execution
- Manages component state and data

### Logging
The bot uses Pino for logging. Pino logs are saved to `logs/`. It is recommended to use the logger utility for all logging:
```typescript
import { logger } from '../util';

logger.info('Your log message');
logger.error('Error message');
logger.warn('Warning message');
logger.debug('Debug message');
```

---

## Troubleshooting

### Common Issues

#### MongoDB Connection Issues
1. Check your MongoDB Atlas connection string
2. Verify your IP is whitelisted in MongoDB Atlas
3. Ensure your database user has proper permissions
4. Check if your MongoDB cluster is running

#### Command Registration Issues
1. Check the command handler logs
2. Verify command structure follows the interface
3. Ensure the bot has proper permissions
4. SubcommandsL Ensure the proper parent ID is set

#### Component Interaction Issues
1. Check the component's custom ID
2. Ensure there are no errors in the component's execute function
3. Ensure any data stored in the component is not too large (you will be notified in the logs)

## License
This project is licensed under the MIT License - see the LICENSE file for details.

# Authors

-   [@gwenphalan](https://www.github.com/gwenphalan)
