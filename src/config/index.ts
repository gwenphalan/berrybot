import dotenv from 'dotenv';
dotenv.config();

export interface Config {
    token: string;
    developer?: string;
    database_name: string;
    mongo_string: string;
}

if (!process.env.DISCORD_TOKEN) {
    throw new Error('No Discord bot token provided.');
} else if (!process.env.MONGO_STRING) {
    throw new Error('No MongoDB connection string provided.');
} else if (!process.env.DATABASE_NAME) {
    console.log('No database name provided. Defaulting to "test".');
}

export const config: Config = {
    token: process.env.DISCORD_TOKEN,
    mongo_string: process.env.MONGO_STRING,
    developer: process.env.DEVELOPER_ID,
    database_name: process.env.DATABASE_NAME || 'development'
};
