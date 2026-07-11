export interface TransactionLike {
  id?: string;
  amount?: number | string;
  type?: string;
  country?: string;
  currency?: string;
  merchant?: string;
  description?: string;
  timestamp?: string;
}

export const buildSampleTransactions = (): TransactionLike[] => [
  {
    id: 'txn-001',
    amount: 6500,
    type: 'wire',
    country: 'IR',
    currency: 'USD',
    merchant: 'Skyline Capital',
    description: 'Large transfer to high-risk region',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'txn-002',
    amount: 1200,
    type: 'crypto_transfer',
    country: 'US',
    currency: 'USD',
    merchant: 'CoinBridge',
    description: 'Crypto transfer from customer account',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'txn-003',
    amount: 800,
    type: 'card_purchase',
    country: 'CA',
    currency: 'CAD',
    merchant: 'Northwind',
    description: 'Normal card purchase',
    timestamp: new Date().toISOString(),
  },
];

export const ingestTransactions = (): TransactionLike[] => {
  return buildSampleTransactions();
};
