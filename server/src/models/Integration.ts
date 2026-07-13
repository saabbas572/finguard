import { Schema, model, Document } from 'mongoose';

export interface IIntegration extends Document {
  userId: string;
  provider: 'stripe' | 'paypal' | 'square' | 'custom';
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    merchantId?: string;
    accountId?: string;
    environment?: 'sandbox' | 'production';
    baseUrl?: string;
    [key: string]: any;
  };
  webhookUrl?: string;
  webhookSecret?: string;
  isActive: boolean;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSchema = new Schema<IIntegration>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'square', 'custom'],
      required: true,
    },
    credentials: {
      type: Schema.Types.Mixed,
      required: true,
      // Note: In production, encrypt these credentials at rest
    },
    webhookUrl: {
      type: String,
    },
    webhookSecret: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    lastSyncedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Don't return credentials in queries by default for security
IntegrationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.credentials;
  delete obj.webhookSecret;
  return obj;
};

export default model<IIntegration>('Integration', IntegrationSchema);
