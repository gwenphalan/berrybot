import mongoose from 'mongoose';

/**
 * Interface for error log document
 * Extends mongoose.Document to include MongoDB document properties
 */
export interface ErrorLog extends mongoose.Document {
	/** Unique error identifier (UUID) */
	errorId: string;
	/** Command name */
	command: string;
	/** Subcommand name (optional) */
	subcommand?: string | null;
	/** Discord user ID */
	user: string;
	/** Discord guild ID (optional) */
	guild?: string | null;
	/** Error message */
	errorMessage: string;
	/** Error stack trace */
	stackTrace: string;
	/** Timestamp of creation */
	createdAt: Date;
	/** Timestamp of last update */
	updatedAt: Date;
}

/**
 * Mongoose schema for error logs
 * Defines the structure and validation for error log documents
 */
const ErrorLogSchema = new mongoose.Schema(
	{
		errorId: {
			type: String,
			required: true,
			index: true,
		},
		command: {
			type: String,
			required: true,
		},
		subcommand: {
			type: String,
			required: false,
			default: null,
		},
		user: {
			type: String,
			required: true,
		},
		guild: {
			type: String,
			required: false,
			default: null,
		},
		errorMessage: {
			type: String,
			required: true,
		},
		stackTrace: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

/**
 * Mongoose model for error logs
 * Provides methods for interacting with error logs in the database
 */
export const ErrorLog = mongoose.model<ErrorLog>('ErrorLog', ErrorLogSchema);
