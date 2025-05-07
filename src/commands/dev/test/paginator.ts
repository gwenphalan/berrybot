import type { Command } from '@/core/interfaces/Command';
import { paginator } from '@/messages';
import { LocalizedSlashCommandBuilder } from '@/core/utils/Locale';

/**
 * Discord slash command implementation
 * @see https://discord.js.org/#/docs/main/stable/class/SlashCommandBuilder
 */
const command: Command = {
	// Command data used for registration and display
	data: new LocalizedSlashCommandBuilder()
		.setName('paginator') // Command name (lowercase, no spaces)
		.setDescription('Test the paginator'), // User-facing command description

	// Command execution handler
	async execute(interaction, client) {
		// Add command logic here

		// 5 pages of lorum ipsum
		const pages = [
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
			'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.',
			'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
		];

		const message = await paginator.build(client, 'paginator', pages, 'Test Paginator', {
			currentPage: 0,
			color: '#00FFFF',
			ephemeral: true,
		});

		await interaction.reply(message);
	},
};

export default command;
