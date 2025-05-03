# Contributing to BerryBot

Thank you for your interest in contributing to BerryBot! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### 1. Fork and Clone

1. Fork the repository
2. Clone your fork:
    ```bash
    git clone https://github.com/your-username/berrybot.git
    cd berrybot
    ```

### 2. Setup Development Environment

1. Install dependencies:

    ```bash
    yarn install
    ```

2. Create a `.env` file:

    ```env
    DISCORD_TOKEN=your_bot_token
    MONGODB_URI=your_mongodb_uri
    ```

3. Build the project:
    ```bash
    yarn build
    ```

### 3. Development Workflow

1. Create a new branch:

    ```bash
    git checkout -b feature/your-feature-name
    ```

2. Make your changes following our coding standards:

    - Use TypeScript
    - Follow ESLint rules
    - Write meaningful commit messages
    - Add tests for new features
    - Update documentation

3. Run tests and linting:

    ```bash
    yarn lint
    yarn format
    ```

4. Commit your changes:

    ```bash
    git commit -m "feat: add new feature"
    ```

5. Push to your fork:
    ```bash
    git push origin feature/your-feature-name
    ```

### 4. Pull Request Process

1. Update the README.md and documentation if needed
2. Ensure all tests pass
3. Update the version number if necessary
4. Create a pull request with a clear description
5. Wait for review and address any feedback

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid using `any` type
- Use proper error handling

### Code Style

- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful comments
- Keep functions small and focused

### Documentation

- Update relevant documentation
- Add JSDoc comments for functions
- Include examples where appropriate
- Document any breaking changes

### Testing

- Write tests for new features
- Ensure existing tests pass
- Test edge cases
- Include integration tests where needed

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

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Pull Request Guidelines

1. **Title**

    - Use conventional commit format
    - Be descriptive but concise

2. **Description**

    - Describe the changes
    - Link related issues
    - Include testing instructions
    - Note any breaking changes

3. **Code Review**
    - Address review comments
    - Keep PRs focused and small
    - Update documentation
    - Ensure tests pass

## Development Tools

### Required Tools

- Node.js 16.9.0+
- Yarn
- TypeScript
- MongoDB

### Recommended Tools

- VS Code
- ESLint
- Prettier
- Git

## Getting Help

- Check the [documentation](docs/)
- Open an [issue](https://github.com/gwenphalan/berrybot/issues)
- Join our [Discord server](https://discord.gg/9kJMfBGFrh)

## License

By contributing to BerryBot, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
