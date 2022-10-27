export const config: Config = require(`./${process.env.NODE_ENV}`).default;

export interface Config {
    /**
     * Your bot token.
     */
    token: string;
    /**
     * Your bot client id.
     */
    client_id: string;
    /**
     * MongoDB Connection String
     */
    mongo_string: string;
    /**
     * Developer Account ID
     */
    developer: string;
}