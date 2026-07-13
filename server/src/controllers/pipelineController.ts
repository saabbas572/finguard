import { Response } from 'express';
import Scenario from '../models/Scenario';
import Alert from '../models/Alert';
import Integration from '../models/Integration';
import { AuthRequest } from '../middleware/authMiddleware';
import { evaluateTransactionAgainstScenarios } from '../utils/pipeline';
import { ingestTransactions } from '../utils/transactionIngestion';
import { ProviderFactory } from '../services/providers';

export const evaluateTransaction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user;
    const { transaction } = req.body;

    if (!transaction) {
      res.status(400).json({ message: 'Transaction payload is required' });
      return;
    }

    const scenarios = await Scenario.find({ userId, isActive: true }).lean();
    const result = evaluateTransactionAgainstScenarios(scenarios, transaction);

    // Save triggered scenarios as alerts
    if (result.triggeredScenarios.length > 0) {
      const alerts = result.triggeredScenarios.map((trigger) => ({
        userId,
        scenarioTitle: trigger.title,
        reason: trigger.reason,
        transactionData: transaction,
        severity: trigger.severity,
        isResolved: false,
      }));

      await Alert.insertMany(alerts);
    }

    const ingestedTransactions = ingestTransactions();
    const ingestedPayload = {
      result,
      ingestedTransactions,
      source: 'sample-ingestion',
    };

    res.status(200).json(ingestedPayload);
  } catch (error: any) {
    console.error('Pipeline evaluation error:', error);
    res.status(500).json({ message: 'Failed to evaluate transaction', error: error.message });
  }
};

/**
 * Evaluate transactions from active payment integration
 * Fetches real transactions from provider and evaluates against active scenarios
 */
export const evaluateIntegrationTransactions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user;
    const { limit = 10 } = req.body;

    console.log(`[Pipeline] Evaluating transactions for user: ${userId}`);

    // Get active integration for user
    const integration = await Integration.findOne({ userId, isActive: true });
    if (!integration) {
      console.log(`[Pipeline] No active integration found for user: ${userId}`);
      res.status(404).json({ message: 'No active payment integration found' });
      return;
    }

    console.log(`[Pipeline] Found active integration: ${integration.provider}`);

    // Create provider instance
    const provider = ProviderFactory.createProvider(
      integration.provider,
      integration.credentials
    );

    // Fetch transactions from provider
    const fetchResult = await provider.fetchTransactions(Number(limit));
    if (!fetchResult.success) {
      console.log(`[Pipeline] Failed to fetch transactions: ${fetchResult.error}`);
      res.status(400).json({ message: 'Failed to fetch transactions from provider', error: fetchResult.error });
      return;
    }

    const { transactions } = fetchResult.data;
    console.log(`[Pipeline] Fetched ${transactions.length} transactions`);

    // Get active scenarios
    const scenarios = await Scenario.find({ userId, isActive: true }).lean();
    console.log(`[Pipeline] Found ${scenarios.length} active scenarios for user: ${userId}`);

    if (scenarios.length === 0) {
      console.log(`[Pipeline] WARNING: No active scenarios found. Alerts won't be created.`);
    }

    // Evaluate all transactions
    const allResults: any[] = [];
    const allAlerts: any[] = [];

    for (const transaction of transactions) {
      console.log(`[Pipeline] Evaluating transaction: ${transaction.id}, Amount: ${transaction.amount}`);
      const result = evaluateTransactionAgainstScenarios(scenarios, transaction);
      allResults.push(result);

      // Create alerts for triggered scenarios (if not already exists)
      if (result.triggeredScenarios.length > 0) {
        console.log(`[Pipeline] Transaction matched ${result.triggeredScenarios.length} scenarios`);
        
        for (const trigger of result.triggeredScenarios) {
          // Check if alert already exists for this transaction and scenario
          const existingAlert = await Alert.findOne({
            userId,
            scenarioTitle: trigger.title,
            'transactionData.id': transaction.id,
          });

          if (!existingAlert) {
            allAlerts.push({
              userId,
              scenarioTitle: trigger.title,
              reason: trigger.reason,
              transactionData: transaction,
              severity: trigger.severity,
              isResolved: false,
            });
            console.log(`[Pipeline] Will create alert for scenario: ${trigger.title}`);
          } else {
            console.log(`[Pipeline] Alert already exists for transaction ${transaction.id} and scenario ${trigger.title} - skipping`);
          }
        }
      }
    }

    // Save all alerts to database (if any new ones)
    if (allAlerts.length > 0) {
      await Alert.insertMany(allAlerts);
      console.log(`[Pipeline] Created ${allAlerts.length} new alerts`);
    } else {
      console.log(`[Pipeline] No new alerts to create (all transactions already processed)`);
    }

    res.status(200).json({
      message: 'Transactions evaluated successfully',
      provider: integration.provider,
      transactionCount: transactions.length,
      alertsCreated: allAlerts.length,
      results: allResults,
      source: 'real-integration',
    });
  } catch (error: any) {
    console.error('Integration pipeline evaluation error:', error);
    res.status(500).json({
      message: 'Failed to evaluate integration transactions',
      error: error.message,
    });
  }
};
