import { Response } from 'express';
import Scenario from '../models/Scenario';
import Alert from '../models/Alert';
import { AuthRequest } from '../middleware/authMiddleware';
import { evaluateTransactionAgainstScenarios } from '../utils/pipeline';

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
        severity: 'high' as const,
        isResolved: false,
      }));

      await Alert.insertMany(alerts);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Pipeline evaluation error:', error);
    res.status(500).json({ message: 'Failed to evaluate transaction', error: error.message });
  }
};
