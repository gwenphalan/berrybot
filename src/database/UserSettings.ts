import mongoose from 'mongoose';

/**
 * Interface for user settings document
 * Extends mongoose.Document to include MongoDB document properties
 */
export interface UserSettings extends mongoose.Document {
	/** The Discord user ID */
	userId: string;
	/** The user's preferred locale (e.g., 'en', 'fr', 'de') */
	locale: string;
}

/**
 * Mongoose schema for user settings
 * Defines the structure and validation for user settings documents
 */
const UserSettingsSchema = new mongoose.Schema({
	/** The Discord user ID */
	userId: {
		type: String,
		required: true,
		unique: true,
		index: true,
	},
	/** The user's preferred locale */
	locale: {
		type: String,
		required: true,
		default: 'en',
	},
});

/**
 * Mongoose model for user settings
 * Provides methods for interacting with user settings in the database
 */
export const UserSettings = mongoose.model<UserSettings>('UserSettings', UserSettingsSchema);
