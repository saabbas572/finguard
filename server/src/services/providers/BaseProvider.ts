/**
 * Base Provider Interface
 * ========================
 * All payment providers must implement this interface
 */

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  country: string;
  type: 'credit' | 'debit' | 'withdrawal' | 'transfer' | 'other';
  merchant: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  [key: string]: any;
}

export interface ProviderCredentials {
  [key: string]: any;
}

export interface ProviderResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export abstract class BaseProvider {
  protected credentials: ProviderCredentials;

  constructor(credentials: ProviderCredentials) {
    this.credentials = credentials;
  }

  /**
   * Authenticate with the provider
   */
  abstract authenticate(): Promise<ProviderResponse>;

  /**
   * Fetch a single transaction by ID
   */
  abstract fetchTransaction(transactionId: string): Promise<ProviderResponse>;

  /**
   * Fetch multiple transactions (paginated)
   */
  abstract fetchTransactions(
    limit?: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<ProviderResponse>;

  /**
   * Transform provider response to standardized transaction format
   */
  abstract normalizeTransaction(rawTransaction: any): Transaction;

  /**
   * Test the connection to the provider
   */
  abstract testConnection(): Promise<ProviderResponse>;
}
