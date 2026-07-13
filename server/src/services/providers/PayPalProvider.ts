/**
 * PayPal Provider Adapter
 * =======================
 * Fetches transactions from PayPal API and normalizes them
 */

import { BaseProvider, Transaction, ProviderResponse, ProviderCredentials } from './BaseProvider';

interface PayPalCredentials extends ProviderCredentials {
  clientId: string;
  clientSecret: string;
  environment?: 'sandbox' | 'production';
}

export class PayPalProvider extends BaseProvider {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken?: string;

  constructor(credentials: PayPalCredentials) {
    super(credentials);
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
    this.baseUrl =
      credentials.environment === 'production'
        ? 'https://api.paypal.com'
        : 'https://api.sandbox.paypal.com';
  }

  async authenticate(): Promise<ProviderResponse> {
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        return {
          success: true,
          data: { message: 'Successfully authenticated with PayPal' },
        };
      } else {
        return {
          success: false,
          error: `Authentication failed: ${response.statusText}`,
        };
      }
    } catch (error) {
      return { success: false, error: 'Failed to authenticate with PayPal' };
    }
  }

  async fetchTransaction(transactionId: string): Promise<ProviderResponse> {
    try {
      if (!this.accessToken) {
        const authResult = await this.authenticate();
        if (!authResult.success) return authResult;
      }

      const response = await fetch(`${this.baseUrl}/v1/reporting/transactions/${transactionId}`, {
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
      return { success: false, error: 'Failed to fetch transaction from PayPal' };
    }
  }

  async fetchTransactions(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date
  ): Promise<ProviderResponse> {
    try {
      if (!this.accessToken) {
        const authResult = await this.authenticate();
        if (!authResult.success) return authResult;
      }

      const startTime = startDate?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endTime = endDate?.toISOString() || new Date().toISOString();

      const params = new URLSearchParams({
        start_date: startTime,
        end_date: endTime,
        page_size: String(limit),
        fields: 'all',
      });

      const response = await fetch(
        `${this.baseUrl}/v1/reporting/transactions?${params.toString()}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const transactions = (data.transaction_details || []).map((tx: any) =>
          this.normalizeTransaction(tx.transaction_info)
        );
        return {
          success: true,
          data: { transactions, total: transactions.length },
        };
      } else {
        return {
          success: false,
          error: `Failed to fetch transactions: ${response.statusText}`,
        };
      }
    } catch (error) {
      return { success: false, error: 'Failed to fetch transactions from PayPal' };
    }
  }

  normalizeTransaction(rawTransaction: any): Transaction {
    return {
      id: rawTransaction.transaction_id || 'unknown',
      amount: parseFloat(rawTransaction.transaction_amount?.value || '0'),
      currency: rawTransaction.transaction_amount?.currency_code || 'USD',
      country: rawTransaction.payer_address?.country_code || 'US',
      type: this.mapTransactionType(rawTransaction.transaction_event_code),
      merchant: rawTransaction.transaction_subject || 'Unknown',
      timestamp: new Date(rawTransaction.transaction_initiation_date),
      status: this.mapTransactionStatus(rawTransaction.transaction_status),
    };
  }

  async testConnection(): Promise<ProviderResponse> {
    return this.authenticate();
  }

  private getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private mapTransactionType(eventCode: string): Transaction['type'] {
    if (eventCode?.includes('MONEY_MOVED_IN')) return 'credit';
    if (eventCode?.includes('MONEY_MOVED_OUT')) return 'debit';
    if (eventCode?.includes('PAYMENT')) return 'credit';
    return 'other';
  }

  private mapTransactionStatus(status: string): Transaction['status'] {
    if (status === 'S') return 'completed';
    if (status === 'P') return 'pending';
    return 'failed';
  }
}
