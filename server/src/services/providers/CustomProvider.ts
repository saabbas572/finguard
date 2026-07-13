/**
 * Generic Custom Provider Adapter
 * ================================
 * Allows integration with any custom payment API
 */

import { BaseProvider, Transaction, ProviderResponse, ProviderCredentials } from './BaseProvider';

interface CustomCredentials extends ProviderCredentials {
  baseUrl: string;
  apiKey: string;
  transactionEndpoint: string;
  authHeaderKey?: string; // Default: X-API-Key
}

export class CustomProvider extends BaseProvider {
  private baseUrl: string;
  private apiKey: string;
  private transactionEndpoint: string;
  private authHeaderKey: string;

  constructor(credentials: CustomCredentials) {
    super(credentials);
    this.baseUrl = credentials.baseUrl;
    this.apiKey = credentials.apiKey;
    this.transactionEndpoint = credentials.transactionEndpoint || '/transactions';
    this.authHeaderKey = credentials.authHeaderKey || 'X-API-Key';
  }

  async authenticate(): Promise<ProviderResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        return {
          success: true,
          data: { message: 'Successfully authenticated with custom provider' },
        };
      } else {
        return {
          success: false,
          error: `Authentication failed: ${response.statusText}`,
        };
      }
    } catch (error) {
      return { success: false, error: 'Failed to authenticate with custom provider' };
    }
  }

  async fetchTransaction(transactionId: string): Promise<ProviderResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.transactionEndpoint}/${transactionId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

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
      return { success: false, error: 'Failed to fetch transaction from custom provider' };
    }
  }

  async fetchTransactions(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date
  ): Promise<ProviderResponse> {
    try {
      let url = `${this.baseUrl}${this.transactionEndpoint}?limit=${limit}`;

      if (startDate) {
        url += `&startDate=${startDate.toISOString()}`;
      }
      if (endDate) {
        url += `&endDate=${endDate.toISOString()}`;
      }

      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        // Assume response is either an array or has a 'data' or 'transactions' field
        const transactions = Array.isArray(data)
          ? data.map((tx: any) => this.normalizeTransaction(tx))
          : (data.data || data.transactions || []).map((tx: any) =>
              this.normalizeTransaction(tx)
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
      return { success: false, error: 'Failed to fetch transactions from custom provider' };
    }
  }

  normalizeTransaction(rawTransaction: any): Transaction {
    // Try to map common field names
    return {
      id: rawTransaction.id || rawTransaction.transactionId || 'unknown',
      amount: parseFloat(rawTransaction.amount || rawTransaction.value || '0'),
      currency: rawTransaction.currency || 'USD',
      country: rawTransaction.country || rawTransaction.countryCode || 'US',
      type: this.mapTransactionType(rawTransaction.type),
      merchant: rawTransaction.merchant || rawTransaction.merchantName || 'Unknown',
      timestamp: new Date(rawTransaction.timestamp || rawTransaction.createdAt),
      status: this.mapTransactionStatus(rawTransaction.status),
    };
  }

  async testConnection(): Promise<ProviderResponse> {
    return this.authenticate();
  }

  private getAuthHeaders() {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    headers[this.authHeaderKey] = this.apiKey;
    return headers;
  }

  private mapTransactionType(type: string): Transaction['type'] {
    const typeStr = (type || 'other').toLowerCase();
    if (typeStr.includes('credit')) return 'credit';
    if (typeStr.includes('debit')) return 'debit';
    if (typeStr.includes('withdrawal')) return 'withdrawal';
    if (typeStr.includes('transfer')) return 'transfer';
    return 'other';
  }

  private mapTransactionStatus(status: string): Transaction['status'] {
    const statusStr = (status || 'failed').toLowerCase();
    if (statusStr.includes('complete') || statusStr === 'success') return 'completed';
    if (statusStr.includes('pending')) return 'pending';
    return 'failed';
  }
}
