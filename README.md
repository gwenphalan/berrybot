![Logo](https://cdn.unimatrix-01.dev/images/berrybot/github_banner.png)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Discord](https://img.shields.io/discord/1034695813026283580?color=%235865F2&label=Discord&logo=Discord)](https://discord.gg/9kJMfBGFrh)
![Version](https://img.shields.io/badge/version-0.0.1-ff69b4)
[![Github Repo](https://img.shields.io/badge/-Github%20Repo-informational?logo=github&style=flat&logoColor=333333&color=333333&labelColor=999999)](https://github.com/gwenphalan/berrybot)

## About

BerryBot is an Open Source discord bot created to replace the corrupt discord bots that have monopolized discord. Too many bots have been created that are designed to milk its users out of as much revenue as possible. BerryBot is designed to be transparent in its data usage and free-to-use forever. There is a berrybot/base branch with a barebones setup for those who want to create their own bots.

## Quick Start

### Prerequisites

- Node.js 16.9.0 or higher
- MongoDB 4.4 or higher
- Discord Bot Token
- TypeScript 4.5 or higher

### Installation

1. **Clone the Repository**

    ```bash
    git clone https://github.com/gwenphalan/berrybot.git
    cd berrybot
    ```

## Setup Wizard

```bash
yarn setup
```

## Manual Setup

1. **Install Dependencies**

    ```bash
    yarn install
    ```

2. **Environment Setup**
   Create a `.env` file in the root directory:

    ```env
    DISCORD_TOKEN=your_bot_token
    MONGO_STRING=your_mongodb_uri
    DEVELOPER_ID=your_user_id
    ```

3. **Build and Start**
    ```bash
    yarn build
    yarn start
    ```

## Documentation

For detailed documentation, please visit our [documentation directory](docs/):

- [Bot Core](docs/bot.md) - Bot initialization and sharding
- [Commands](docs/commands.md) - Command system
- [Events](docs/events.md) - Event handling
- [Flows](docs/flows.md) - Interactive flows
- [Message Components](docs/message_component.md) - Interactive components
- [Message Templates](docs/message_template.md) - Message templates
- [Database](docs/database.md) - Database integration
- [Configuration](docs/configuration.md) - Bot configuration
- [Utilities](docs/utilities.md) - Utility functions
- [Interfaces](docs/interfaces.md) - TypeScript interfaces

## Development

### Scripts

```bash
yarn setup       # Interactive setup wizard for first-time installation
yarn build        # Build the project
yarn start        # Start the bot
yarn dev          # Start in development mode
yarn lint         # Run ESLint
yarn format       # Format code with Prettier
yarn clean        # Clean build files
yarn reinstall    # Clean and reinstall dependencies
```

### Project Structure

```
berrybot/
├── src/          # Source code
├── docs/         # Documentation
├── tests/        # Test files
└── config/       # Configuration files
```

## Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- [GitHub Issues](https://github.com/gwenphalan/berrybot/issues)
- [Discord Server](https://discord.gg/9kJMfBGFrh)

## Authors

- [@gwenphalan](https://www.github.com/gwenphalan)
