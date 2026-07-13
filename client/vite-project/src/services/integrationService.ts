import api from './api';

export interface IntegrationConfig {
  _id?: string;
  provider: 'stripe' | 'paypal' | 'square' | 'custom';
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    merchantId?: string;
    locationId?: string;
    baseUrl?: string;
    environment?: 'sandbox' | 'production';
    [key: string]: any;
  };
  webhookUrl?: string;
  isActive: boolean;
}

export const integrationService = {
  // Get all integrations
  async getIntegrations() {
    const { data } = await api.get('/integrations');
    return data;
  },

  // Get active integration
  async getActiveIntegration() {
    const { data } = await api.get('/integrations/active');
    return data;
  },

  // Save (create or update) integration
  async saveIntegration(integration: IntegrationConfig) {
    const { data } = await api.post('/integrations', integration);
    return data;
  },

  // Delete integration
  async deleteIntegration(integrationId: string) {
    const { data } = await api.delete(`/integrations/${integrationId}`);
    return data;
  },

  // Test connection
  async testConnection(provider: string, credentials: any) {
    const { data } = await api.post('/integrations/test', { provider, credentials });
    return data;
  },

  // Fetch transactions from active integration
  async fetchTransactions(limit?: number, startDate?: Date, endDate?: Date) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const query = params.toString() ? `?${params.toString()}` : '';
    const { data } = await api.get(`/integrations/transactions${query}`);
    return data;
  },
};
