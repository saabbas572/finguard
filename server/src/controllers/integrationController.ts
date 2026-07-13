import { Request, Response } from 'express';
import Integration from '../models/Integration';
import { AuthRequest } from '../middleware/authMiddleware';

// Get all integrations for a user
export const getIntegrations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const integrations = await Integration.find({ userId });
    res.json(integrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
};

// Get active integration
export const getActiveIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const integration = await Integration.findOne({ userId, isActive: true });
    if (!integration) {
      return res.status(404).json({ error: 'No active integration found' });
    }
    res.json(integration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active integration' });
  }
};

// Create or update integration
export const saveIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { provider, credentials, webhookUrl, isActive, integrationId } = req.body;

    if (!provider || !credentials) {
      return res.status(400).json({ error: 'Provider and credentials are required' });
    }

    let integration;

    if (integrationId) {
      // Update existing
      integration = await Integration.findById(integrationId);
      if (!integration || integration.userId !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this integration' });
      }
      integration.credentials = credentials;
      integration.webhookUrl = webhookUrl;
      integration.isActive = isActive || false;
    } else {
      // Create new
      // If setting as active, deactivate others
      if (isActive) {
        await Integration.updateMany({ userId }, { isActive: false });
      }
      integration = new Integration({
        userId,
        provider,
        credentials,
        webhookUrl,
        isActive: isActive || false,
      });
    }

    await integration.save();
    res.json(integration);
  } catch (error) {
    console.error('Integration save error:', error);
    res.status(500).json({ error: 'Failed to save integration' });
  }
};

// Delete integration
export const deleteIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { integrationId } = req.params;

    const integration = await Integration.findById(integrationId);
    if (!integration || integration.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this integration' });
    }

    await Integration.deleteOne({ _id: integrationId });
    res.json({ message: 'Integration deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete integration' });
  }
};

// Test connection
export const testConnection = async (req: AuthRequest, res: Response) => {
  try {
    const { provider, credentials } = req.body;

    if (!provider || !credentials) {
      return res.status(400).json({ error: 'Provider and credentials are required' });
    }

    // Provider-specific test logic
    const testResults = await testProviderConnection(provider, credentials);

    if (testResults.success) {
      res.json({ message: 'Connection successful', details: testResults });
    } else {
      res.status(400).json({ error: testResults.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Test connection failed' });
  }
};

// Test specific provider connection
async function testProviderConnection(provider: string, credentials: any) {
  switch (provider) {
    case 'stripe':
      return testStripeConnection(credentials);
    case 'paypal':
      return testPayPalConnection(credentials);
    case 'square':
      return testSquareConnection(credentials);
    case 'custom':
      return testCustomConnection(credentials);
    default:
      return { success: false, error: 'Unknown provider' };
  }
}

async function testStripeConnection(credentials: any) {
  try {
    const { apiKey } = credentials;
    if (!apiKey) return { success: false, error: 'API Key is required' };

    // Test by making a simple API call
    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Stripe connection successful',
        provider: 'stripe',
      };
    } else {
      return {
        success: false,
        error: `Stripe API error: ${response.statusText}`,
      };
    }
  } catch (error) {
    return { success: false, error: 'Failed to test Stripe connection' };
  }
}

async function testPayPalConnection(credentials: any) {
  try {
    const { clientId, clientSecret, environment } = credentials;
    if (!clientId || !clientSecret) {
      return {
        success: false,
        error: 'Client ID and Client Secret are required',
      };
    }

    const baseUrl =
      environment === 'production'
        ? 'https://api.paypal.com'
        : 'https://api.sandbox.paypal.com';

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (response.ok) {
      return {
        success: true,
        message: 'PayPal connection successful',
        provider: 'paypal',
      };
    } else {
      return { success: false, error: `PayPal error: ${response.statusText}` };
    }
  } catch (error) {
    return { success: false, error: 'Failed to test PayPal connection' };
  }
}

async function testSquareConnection(credentials: any) {
  try {
    const { accessToken, environment } = credentials;
    if (!accessToken) return { success: false, error: 'Access Token is required' };

    const baseUrl =
      environment === 'production'
        ? 'https://connect.squareup.com'
        : 'https://connect.squareupsandbox.com';

    const response = await fetch(`${baseUrl}/v2/customers`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Square-Version': '2024-06-05',
      },
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Square connection successful',
        provider: 'square',
      };
    } else {
      return { success: false, error: `Square error: ${response.statusText}` };
    }
  } catch (error) {
    return { success: false, error: 'Failed to test Square connection' };
  }
}

async function testCustomConnection(credentials: any) {
  try {
    const { baseUrl, apiKey } = credentials;
    if (!baseUrl || !apiKey) {
      return { success: false, error: 'Base URL and API Key are required' };
    }

    const response = await fetch(`${baseUrl}/health`, {
      headers: {
        'X-API-Key': apiKey,
      },
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Custom connection successful',
        provider: 'custom',
      };
    } else {
      return { success: false, error: `Custom API error: ${response.statusText}` };
    }
  } catch (error) {
    return { success: false, error: 'Failed to test custom connection' };
  }
}
