import React, { useState, useEffect } from 'react';
import { integrationService } from '../services/integrationService';
import type { IntegrationConfig } from '../services/integrationService';

export const IntegrationSettings: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('stripe');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<any>({});
  const [isActive, setIsActive] = useState(false);

  // Load integrations on mount
  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const data = await integrationService.getIntegrations();
      setIntegrations(data || []);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value;
    setSelectedProvider(provider);
    
    // Initialize credentials based on provider type
    switch (provider) {
      case 'stripe':
        setCredentials({ apiKey: '' });
        break;
      case 'paypal':
        setCredentials({ clientId: '', clientSecret: '', environment: 'sandbox' });
        break;
      case 'square':
        setCredentials({ accessToken: '', environment: 'sandbox' });
        break;
      case 'custom':
        setCredentials({ baseUrl: '', endpoint: '', apiKey: '', headerKey: 'Authorization', fieldMapping: '{}' });
        break;
      default:
        setCredentials({});
    }
    
    setTestResult(null);
    setEditingId(null);
  };

  const handleCredentialChange = (key: string, value: string) => {
    setCredentials({ ...credentials, [key]: value });
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const result = await integrationService.testConnection(selectedProvider, credentials);
      setTestResult({ success: true, data: result });
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.response?.data?.error || 'Connection test failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!credentials || Object.keys(credentials).length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const config: IntegrationConfig = {
        _id: editingId || undefined,
        provider: selectedProvider as any,
        credentials,
        isActive,
      };

      await integrationService.saveIntegration(config);
      alert(editingId ? 'Integration updated' : 'Integration saved');
      loadIntegrations();
      setCredentials({});
      setEditingId(null);
      setTestResult(null);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save integration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this integration?')) {
      try {
        await integrationService.deleteIntegration(id);
        loadIntegrations();
      } catch (error) {
        alert('Failed to delete integration');
      }
    }
  };

  const handleEdit = (integration: IntegrationConfig) => {
    setSelectedProvider(integration.provider);
    setCredentials(integration.credentials);
    setIsActive(integration.isActive);
    setEditingId(integration._id || null);
    setTestResult(null);
  };

  const renderCredentialFields = () => {
    // Safety check: ensure credentials exists
    if (!credentials) {
      return <div className="text-gray-500">Loading...</div>;
    }

    switch (selectedProvider) {
      case 'stripe':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="sk_test_..."
                value={credentials.apiKey || ''}
                onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        );

      case 'paypal':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Your PayPal Client ID"
                value={credentials.clientId || ''}
                onChange={(e) => handleCredentialChange('clientId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                Client Secret <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Your PayPal Client Secret"
                value={credentials.clientSecret || ''}
                onChange={(e) => handleCredentialChange('clientSecret', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                Environment <span className="text-red-500">*</span>
              </label>
              <select
                value={credentials.environment || 'sandbox'}
                onChange={(e) => handleCredentialChange('environment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sandbox">Sandbox (Testing)</option>
                <option value="production">Production</option>
              </select>
            </div>
          </>
        );

      case 'square':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Token <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Your Square Access Token"
                value={credentials.accessToken || ''}
                onChange={(e) => handleCredentialChange('accessToken', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                Location ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Your Square Location ID"
                value={credentials.locationId || ''}
                onChange={(e) => handleCredentialChange('locationId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                Environment <span className="text-red-500">*</span>
              </label>
              <select
                value={credentials.environment || 'sandbox'}
                onChange={(e) => handleCredentialChange('environment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sandbox">Sandbox (Testing)</option>
                <option value="production">Production</option>
              </select>
            </div>
          </>
        );

      case 'custom':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="https://api.example.com"
                value={credentials.baseUrl || ''}
                onChange={(e) => handleCredentialChange('baseUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Your API Key"
                value={credentials.apiKey || ''}
                onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                Transaction Endpoint
              </label>
              <input
                type="text"
                placeholder="/transactions (default)"
                value={credentials.transactionEndpoint || ''}
                onChange={(e) => handleCredentialChange('transactionEndpoint', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Payment Integration</h1>

          {/* Provider Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Provider <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProvider}
              onChange={handleProviderChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
              <option value="square">Square</option>
              <option value="custom">Custom API</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Select the payment provider you want to integrate with.
            </p>
          </div>

          {/* Credential Fields */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Credentials</h2>
            {renderCredentialFields()}
          </div>

          {/* Active Toggle */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Set as active integration (only one can be active)
              </span>
            </label>
          </div>

          {/* Test Connection */}
          <div className="mb-6">
            <button
              onClick={handleTestConnection}
              disabled={isLoading}
              className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </button>
            {testResult && (
              <div
                className={`mt-4 p-4 rounded-md ${
                  testResult.success
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                <p className="font-semibold">
                  {testResult.success ? '✓ Connection Successful' : '✗ Connection Failed'}
                </p>
                <p className="text-sm mt-1">{testResult.data?.message || testResult.error}</p>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-md transition duration-200 mb-8"
          >
            {isLoading ? 'Saving...' : editingId ? 'Update Integration' : 'Save Integration'}
          </button>

          {/* Saved Integrations */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Integrations</h2>
            {integrations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No integrations configured yet</p>
            ) : (
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div
                    key={integration._id}
                    className="border border-gray-300 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">
                        {integration.provider}
                      </p>
                      <p className="text-sm text-gray-600">
                        {integration.isActive ? (
                          <span className="text-green-600 font-semibold">● Active</span>
                        ) : (
                          <span className="text-gray-500">Inactive</span>
                        )}
                      </p>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleEdit(integration)}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(integration._id!)}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">How to Get Credentials</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>
                <strong>Stripe:</strong> Get API Key from{' '}
                <a
                  href="https://dashboard.stripe.com/apikeys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  dashboard
                </a>
              </li>
              <li>
                <strong>PayPal:</strong> Create app in{' '}
                <a
                  href="https://developer.paypal.com/dashboard/apps/sandbox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Developer Dashboard
                </a>
              </li>
              <li>
                <strong>Square:</strong> Get token from{' '}
                <a
                  href="https://developer.squareup.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Developer Dashboard
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">What Happens Next</h3>
            <p className="text-sm text-purple-800">
              Once you save an integration, FinGuard will fetch real transactions from your payment
              provider and evaluate them against your alert scenarios automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettings;
