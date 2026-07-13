/**
 * Square Provider Adapter
 * =======================
 * Fetches transactions from Square API and normalizes them
 */

import { BaseProvider, Transaction, ProviderResponse, ProviderCredentials } from './BaseProvider';

interface SquareCredentials extends ProviderCredentials {
  accessToken: string;
  locationId: string;
  environment?: 'sandbox' | 'production';
}

export class SquareProvider extends BaseProvider {
  private baseUrl: string;
  private accessToken: string;
  private locationId: string;

  constructor(credentials: SquareCredentials) {
    super(credentials);
    this.accessToken = credentials.accessToken;
    this.locationId = credentials.locationId;
    this.baseUrl =
      credentials.environment === 'production'
        ? 'https://connect.squareup.com'
        : 'https://connect.squareupsandbox.com';
  }

  async authenticate(): Promise<ProviderResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/merchants/me`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        return {
          success: true,
          data: { message: 'Successfully authenticated with Square' },
        };
      } else {
        return {
          success: false,
          error: `Authentication failed: ${response.statusText}`,
        };
      }
    } catch (error) {
      return { success: false, error: 'Failed to authenticate with Square' };
    }
  }

  async fetchTransaction(transactionId: string): Promise<ProviderResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v2/locations/${this.locationId}/transactions/${transactionId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: this.normalizeTransaction(data.transaction),
        };
      } else {
        return {
          success: false,
          error: `Failed to fetch transaction: ${response.statusText}`,
        };
      }
    } catch (error) {
      return { success: false, error: 'Failed to fetch transaction from Square' };
    }
  }

  async fetchTransactions(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date
  ): Promise<ProviderResponse> {
    try {
      const body: any = {
        query: {
          filter: {
            date_time_filter: {
              created_at: {},
            },
          },
          sort: {
            sort_field: 'CREATED_AT',
            sort_order: 'DESC',
          },
          limit,
        },
      };

      if (startDate) {
        body.query.filter.date_time_filter.created_at.start_at =
          startDate.toISOString();
      }
      if (endDate) {
        body.query.filter.date_time_filter.created_at.end_at = endDate.toISOString();
      }

      const response = await fetch(
        `${this.baseUrl}/v2/locations/${this.locationId}/transactions/search`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const transactions = (data.transactions || []).map((tx: any) =>
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
      return { success: false, error: 'Failed to fetch transactions from Square' };
    }
  }

  normalizeTransaction(rawTransaction: any): Transaction {
    const tenders = rawTransaction.tenders || [];
    const tender = tenders[0] || {};
    const amount = tender.amount_money?.amount || 0;

    return {
      id: rawTransaction.id,
      amount: amount / 100, // Square uses cents
      currency: tender.amount_money?.currency || 'USD',
      country: 'US', // Square doesn't easily expose country in transaction
      type: this.mapTransactionType(tender.type),
      merchant: `Square Transaction ${rawTransaction.id}`,
      timestamp: new Date(rawTransaction.created_at),
      status: this.mapTransactionStatus(rawTransaction.void_at ? 'VOIDED' : 'COMPLETED'),
    };
  }

  async testConnection(): Promise<ProviderResponse> {
    return this.authenticate();
  }

  private getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'Square-Version': '2024-06-05',
    };
  }

  private mapTransactionType(type: string): Transaction['type'] {
    if (type === 'CARD') return 'debit';
    if (type === 'CASH') return 'debit';
    if (type === 'OTHER') return 'other';
    return 'other';
  }

  private mapTransactionStatus(status: string): Transaction['status'] {
    if (status === 'COMPLETED') return 'completed';
    if (status === 'PENDING') return 'pending';
    return 'failed';
  }
}
