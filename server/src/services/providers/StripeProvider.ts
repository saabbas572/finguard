/**
 * Stripe Provider Adapter
 * =======================
 * Fetches transactions from Stripe API and normalizes them
 */

import { BaseProvider, Transaction, ProviderResponse, ProviderCredentials } from './BaseProvider';

interface StripeCredentials extends ProviderCredentials {
  apiKey: string;
  accountId?: string;
  environment?: 'sandbox' | 'production';
}

export class StripeProvider extends BaseProvider {
  private baseUrl = 'https://api.stripe.com/v1';
  private apiKey: string;

  constructor(credentials: StripeCredentials) {
    super(credentials);
    this.apiKey = credentials.apiKey;
  }

  async authenticate(): Promise<ProviderResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/balance`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        return {
          success: true,
          data: { message: 'Successfully authenticated with Stripe' },
        };
      } else {
        return {
          success: false,
          error: `Authentication failed: ${response.statusText}`,
        };
      }
    } catch (error) {
      return { success: false, error: 'Failed to authenticate with Stripe' };
    }
  }

  async fetchTransactions(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date
  ): Promise<ProviderResponse> {
    try {
      // Build URL for Stripe API with proper expand syntax for list endpoint
      let url = `${this.baseUrl}/charges?limit=${limit}&expand[]=data.customer`;

      if (startDate) {
        url += `&created[gte]=${Math.floor(startDate.getTime() / 1000)}`;
      }
      if (endDate) {
        url += `&created[lte]=${Math.floor(endDate.getTime() / 1000)}`;
      }

      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        const transactions = (data.data || []).map((charge: any) =>
          this.normalizeTransaction(charge)
        );
        return {
          success: true,
          data: { transactions, total: data.data.length },
        };
      } else {
        const errorData = await response.text();
        return {
          success: false,
          error: `Failed to fetch transactions: ${response.statusText} - ${errorData}`,
        };
      }
    } catch (error) {
      return { success: false, error: 'Failed to fetch transactions from Stripe' };
    }
  }

  async fetchTransaction(transactionId: string): Promise<ProviderResponse> {
    try {
      // Use correct expand syntax for single charge endpoint
      const response = await fetch(`${this.baseUrl}/charges/${transactionId}?expand[]=customer`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: this.normalizeTransaction(data),
        };
      } else {
        return {
          success: false,
          error: `Failed to fetch transaction: ${response.statusText}`,
        };
      }
    } catch (error) {
      return { success: false, error: 'Failed to fetch transaction from Stripe' };
    }
  }

  normalizeTransaction(rawCharge: any): Transaction {
    // Customer is now expanded and is an object (not just an ID string)
    const customer = typeof rawCharge.customer === 'object' ? rawCharge.customer : null;
    
    const customerId = customer?.id || (typeof rawCharge.customer === 'string' ? rawCharge.customer : null);
    
    // Get customer name and email from expanded customer object
    const customerName = customer?.name || 
                        rawCharge.billing_details?.name ||
                        rawCharge.metadata?.customer_name ||
                        'Unknown Customer';
    
    const email = customer?.email ||
                 rawCharge.billing_details?.email ||
                 rawCharge.metadata?.customer_email ||
                 'Not provided';
    
    // Extract reason/description
    const reason = rawCharge.description || 
                  rawCharge.metadata?.reason ||
                  rawCharge.statement_descriptor ||
                  'No description provided';

    return {
      id: rawCharge.id,
      amount: rawCharge.amount / 100, // Stripe uses cents
      currency: rawCharge.currency?.toUpperCase() || 'USD',
      country: rawCharge.billing_details?.address?.country || 'US',
      type: this.mapChargeType(rawCharge),
      merchant: rawCharge.description || rawCharge.statement_descriptor || 'Unknown',
      timestamp: new Date(rawCharge.created * 1000),
      status: this.mapChargeStatus(rawCharge.status),
      // Additional customer & transaction details
      customerId,
      customerName,
      email,
      reason,
      cardBrand: rawCharge.payment_method_details?.card?.brand || 'Unknown',
      cardLast4: rawCharge.payment_method_details?.card?.last4 || 'XXXX',
      metadata: rawCharge.metadata || {},
    };
  }

  async testConnection(): Promise<ProviderResponse> {
    return this.authenticate();
  }

  private getAuthHeaders() {
    const auth = Buffer.from(`${this.apiKey}:`).toString('base64');
    return {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  private mapChargeType(charge: any): Transaction['type'] {
    if (charge.amount < 0) return 'debit';
    if (charge.captured) return 'credit';
    return 'other';
  }

  private mapChargeStatus(status: string): Transaction['status'] {
    if (status === 'succeeded') return 'completed';
    if (status === 'pending') return 'pending';
    return 'failed';
  }
}
