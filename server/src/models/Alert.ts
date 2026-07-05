/**
 * Alert Model
 * ===========
 * Stores triggered alert events when scenarios match transactions
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IAlert extends Document {
  userId: mongoose.Types.ObjectId;
  scenarioTitle: string;
  reason: string;
  transactionData: Record<string, any>;
  severity: 'low' | 'medium' | 'high';
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scenarioTitle: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    transactionData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    isResolved: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAlert>('Alert', AlertSchema);
