module.exports = {
	apps: [
		{
			name: 'berrybot-dev',
			script: 'yarn.cmd',
			args: 'run:dev',
			watch: ['src', 'locales', 'package.json', 'tsconfig.json'],
			ignore_watch: ['dist', 'log', 'node_modules'],
			env: {
				NODE_ENV: 'development',
			},
			autorestart: true,
			max_restarts: 10,
			restart_delay: 2000,
		},
	],
};
