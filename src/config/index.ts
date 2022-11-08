import dotenv from 'dotenv';
dotenv.config();

export interface Config {
    token: string;
    developer?: string;
}

if (!process.env.DISCORD_TOKEN) {
    throw new Error('No Discord bot token provided.');
}

export const config: Config = {
    token: process.env.DISCORD_TOKEN,
    developer: process.env.DEVELOPER_ID
};
