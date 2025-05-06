import mongoose from 'mongoose';
import { FlowState } from '@/core/interfaces/Flow';

/**
 * Interface for flow document
 * Extends mongoose.Document to include MongoDB document properties
 */
export interface Flows extends mongoose.Document {
	guildId: string;
	messageId: string;
	userId?: string;
	flowType: string;
	currentState: FlowState;
	data: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
	expiresAt?: Date;
}

/**
 * Mongoose schema for flows
 * Defines the structure and validation for flow documents
 */
const FlowsSchema = new mongoose.Schema(
	{
		guildId: {
			type: String,
			required: true,
			index: true,
		},
		messageId: {
			type: String,
			required: true,
		},
		userId: {
			type: String,
			required: false,
			index: true,
		},
		flowType: {
			type: String,
			required: true,
			enum: ['ROLE_SELECT'], // Add other flow types as needed
			index: true,
		},
		currentState: {
			id: {
				type: String,
				required: true,
			},
			data: {
				type: Map,
				of: mongoose.Schema.Types.Mixed,
				default: new Map(),
			},
			previous: {
				type: String,
				required: false,
			},
		},
		data: {
			type: Map,
			of: mongoose.Schema.Types.Mixed,
			default: new Map(),
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
		expiresAt: {
			type: Date,
			required: false,
		},
	},
	{
		timestamps: true,
	}
);

// Create compound index for efficient querying
FlowsSchema.index({ messageId: 1 }, { unique: true });
FlowsSchema.index({ guildId: 1, flowType: 1 });
FlowsSchema.index({ guildId: 1, userId: 1, flowType: 1 }, { sparse: true });

/**
 * Mongoose model for flows
 * Provides methods for interacting with flows in the database
 */
export const Flows = mongoose.model<Flows>('Flows', FlowsSchema);
