/**
 * Scenario Model
 * ==============
 * Represents a financial scenario that users create and manage
 * 
 * A scenario contains:
 * - Basic info: title, description
 * - Owner: userId (references User collection)
 * - Scenario data: type, parameters (financial inputs)
 * - Status: isActive (can toggle active/inactive)
 * - Timestamps: createdAt, updatedAt
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * IScenario Interface
 * TypeScript interface for type safety
 */
export interface IScenario extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: string; // e.g., 'retirement', 'investment', 'debt-payoff'
  parameters: Record<string, any>; // Flexible JSON object for scenario data
  severity: 'low' | 'medium' | 'high'; // Alert severity level when this scenario triggers
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Scenario Schema Definition
 */
const ScenarioSchema = new Schema<IScenario>(
  {
    // Link to the user who created this scenario
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Index for faster queries by userId
    },
    
    // Scenario name/title
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    
    // Optional description
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    
    // Type of scenario
    type: {
      type: String,
      required: true,
      enum: ['retirement', 'investment', 'debt-payoff', 'savings', 'custom'],
      default: 'custom',
    },
    
    // Flexible parameters object for scenario-specific data
    // Examples:
    // { income: 50000, expenses: 30000, savingsRate: 0.2 }
    // { initialAmount: 100000, annualReturn: 0.07, years: 20 }
    parameters: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    
    // Alert severity level when scenario triggers
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      required: true,
    },
    
    // Whether scenario is active/inactive
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { 
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Export Model
 */
export default mongoose.model<IScenario>('Scenario', ScenarioSchema);
