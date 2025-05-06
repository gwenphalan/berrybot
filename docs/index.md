# BerryBot Documentation

Welcome to the BerryBot documentation! This guide will help you understand and work with the BerryBot framework.

## Table of Contents

### Core Documentation

- [Bot Core](bot.md) - Bot initialization, sharding, and core functionality
- [Interfaces](interfaces.md) - Core interfaces and types used throughout the bot
- [Utilities](utilities.md) - Utility functions and helper modules

### Features

- [Commands](commands.md) - Command system and slash command implementation
- [Events](events.md) - Event handling system
- [Flows](flows.md) - Interactive flow system for complex interactions
- [Message Components](message_component.md) - Interactive message components (buttons, select menus, modals)
- [Message Templates](message_template.md) - Reusable message templates

### Data Management

- [Database](database.md) - Database integration and schema management
- [Configuration](configuration.md) - Bot configuration and settings

## Getting Started

### Prerequisites

- Node.js 16.9.0 or higher
- MongoDB 4.4 or higher
- Discord Bot Token
- TypeScript 4.5 or higher

### Installation

1. **Clone the Repository**

    ```bash
    git clone https://github.com/yourusername/berrybot.git
    cd berrybot
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

    ```env
    DISCORD_TOKEN=your_bot_token
    MONGODB_URI=your_mongodb_uri
    ```

4. **Build the Project**

    ```bash
    npm run build
    ```

5. **Start the Bot**
    ```bash
    npm start
    ```

### Setting Up Emojis

BerryBot uses custom emojis in its messages and interactive components. To set up these emojis:

1. **Requirements**

    - A Discord server with at least 50 available emoji slots for static emojis
    - Administrator permissions or "Manage Emojis" permission on the server
    - The bot must have the "Manage Emojis and Stickers" permission

2. **Running the Emoji Command**

    - Invite the bot to your server
    - Run the `/emoji` command in any channel
    - The command is developer-only and will upload all required emojis to your server

3. **What the Command Does**

    - Checks for existing emojis and reconciles them with the bot's emoji registry
    - Uploads any missing emojis from the bot's emoji directory
    - Updates the emoji registry (emojis.json) with the new emoji IDs
    - Displays a comprehensive list of existing, reconciled, and newly added emojis

4. **Troubleshooting**

    - If the command fails, ensure the bot has proper permissions
    - Check that your server has enough emoji slots available
    - For large emoji sets, the process may take several minutes due to Discord's rate limits

5. **Results**
    - The emojis are uploaded to the server in batches, and their ID's are written to `emojis/emojis.json`

After completing this setup, BerryBot will be able to use all its custom emojis in messages and components throughout your server.

### Adding New Emojis

BerryBot's emoji system can be expanded with new emojis. Here's how to add new emojis to the bot:

1. **Downloading Emojis**

    - Find and download emojis from [emoji.gg](https://emoji.gg) or other sources
    - Save the downloaded emoji files to the `/emojis` directory in the project root

2. **Processing Emojis with filter-emojis**

    - Run the automation script to process the new emojis:
        ```bash
        yarn filter-emojis
        ```

3. **What the Script Does**

    - Automatically renames emoji files to follow naming conventions
    - Checks for and prevents duplicate emojis in the system
    - Adds new entries to the `emojis.json` configuration file
    - Updates the `Emoji` TypeScript interface in `/config/index.ts`

4. **Verification**

    - After running the script, check `/emojis` directory for the renamed files
    - Review `emojis.json` to ensure new entries were added correctly
    - Verify that the `Emoji` interface in `/config/index.ts` includes the new emoji names

5. **Adding to Discord Server**
    - After processing the emojis, run the `/emoji` command as described in the previous section
    - The command will upload any newly added emojis to your Discord server

This workflow ensures that all emojis are properly integrated into BerryBot's typing system and configuration, allowing them to be used in code with proper TypeScript support.

## Project Structure

```
berrybot/
├── src/
│   ├── commands/       # Slash commands
│   ├── components/     # Message components
│   ├── events/         # Event handlers
│   ├── flows/          # Interactive flows
│   ├── handlers/       # Core handlers
│   ├── interfaces/     # TypeScript interfaces
│   ├── messages/       # Message templates
│   ├── models/         # Database models
│   ├── util/           # Utility functions
│   ├── bot.ts          # Bot initialization
│   └── index.ts        # Entry point
├── docs/               # Documentation
├── tests/              # Test files
└── config/             # Configuration files
```

## Core Concepts

### Bot Architecture

BerryBot is built on a modular architecture with the following key components:

1. **Client**

    - Core bot instance
    - Handles Discord.js integration
    - Manages sharding and IPC

2. **Command System**

    - Slash command support
    - Subcommand handling
    - Permission management

3. **Event System**

    - Discord event handling
    - Custom event support
    - Error management

4. **Flow System**

    - State management
    - Interactive flows
    - Sub-flow support

5. **Message Components**
    - Buttons
    - Select menus
    - Modals

### Development

1. **Creating Commands**

    ```typescript
    import { BaseCommand } from './interfaces';

    const command: BaseCommand = {
    	data: new SlashCommandBuilder().setName('ping').setDescription('Check bot latency'),
    	execute: async (interaction) => {
    		await interaction.reply('Pong!');
    	},
    };
    ```

2. **Adding Events**

    ```typescript
    import { Event } from './interfaces';

    const event: Event = {
    	name: 'ready',
    	once: true,
    	execute: (client) => {
    		console.log(`Logged in as ${client.user?.tag}`);
    	},
    };
    ```

3. **Creating Message Components**

    ```typescript
    import { ButtonComponent } from './interfaces';

    const button: ButtonComponent = {
    	id: 'example-button',
    	type: 'BUTTON',
    	execute: async (interaction) => {
    		await interaction.reply('Button clicked!');
    	},
    };
    ```

### Best Practices

1. **Code Organization**

    - Follow the modular structure
    - Use appropriate interfaces
    - Implement proper error handling

2. **Performance**

    - Use appropriate intents
    - Implement caching
    - Monitor resource usage

3. **Security**

    - Validate user input
    - Handle permissions properly
    - Secure sensitive data

4. **Maintenance**
    - Keep dependencies updated
    - Monitor error logs
    - Regular backups

## Contributing

We welcome contributions to BerryBot! Please follow these guidelines:

1. **Code Style**

    - Follow TypeScript best practices
    - Use proper documentation
    - Write unit tests

2. **Pull Requests**

    - Clear description
    - Related issue reference
    - Passing tests

3. **Documentation**
    - Update relevant docs
    - Add examples
    - Include type definitions

## Support

If you need help or have questions:

1. **Documentation**

    - Check the relevant guide
    - Search existing issues
    - Review examples

2. **Issues**

    - Use the issue tracker
    - Provide detailed information
    - Include reproduction steps

3. **Community**
    - Join our [Discord server](https://discord.gg/82WsGtJmBd)
    - Ask in discussions
    - Share your experience

## License

BerryBot is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.
