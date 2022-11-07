import dotenv from 'dotenv';
if (process.env.NODE_ENV === 'development') dotenv.config();

export interface Config {
    /**
     * Your bot token.
     */
    token: string;
    /**
     * MongoDB Connection String
     */
    mongo_string: string;
    /**
     * Developer Account ID
     */
    developer: string;
    /**
     * The MongoDB Databse you would like to connect to (ie. 'test', 'production')
     */
    database: string;
}

if (!process.env.DISCORD_TOKEN) {
    throw new Error('No Discord bot token provided.');
} else if (!process.env.MONGO_STRING) {
    throw new Error('No MongoDB connection string provided.');
} else if (!process.env.DEVELOPER_ID) {
    throw new Error('No developer account id provided.');
} else if (!process.env.DATABASE_ID) {
    console.log('No database name provided. Defaulting to "test".');
}

export const config: Config = {
    token: process.env.DISCORD_TOKEN,
    mongo_string: process.env.MONGO_STRING,
    developer: process.env.DEVELOPER_ID,
    database: process.env.DATABASE_ID || 'test'
};
