/**
 * Alerts Controller
 * =================
 * Handles alert management and retrieval
 */

import { Response } from 'express';
import Alert from '../models/Alert';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * GET - Fetch all alerts for logged-in user
 * Optional filtering by resolved status, severity, etc.
 */
export const getAlerts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user;
    const { isResolved, severity, sort } = req.query;

    const filter: any = { userId };

    if (isResolved !== undefined) {
      filter.isResolved = isResolved === 'true';
    }
    if (severity) {
      filter.severity = severity;
    }

    let sortOption: any = { createdAt: -1 }; // Default: newest first
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const alerts = await Alert.find(filter).sort(sortOption).lean();

    res.status(200).json(alerts);
  } catch (error: any) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Failed to fetch alerts', error: error.message });
  }
};

/**
 * PATCH - Mark alert as resolved
 */
export const resolveAlert = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user;

    const alert = await Alert.findById(id);

    if (!alert) {
      res.status(404).json({ message: 'Alert not found' });
      return;
    }

    if (alert.userId.toString() !== userId) {
      res.status(403).json({ message: 'Not authorized to resolve this alert' });
      return;
    }

    alert.isResolved = true;
    const updated = await alert.save();

    res.status(200).json(updated);
  } catch (error: any) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ message: 'Failed to resolve alert', error: error.message });
  }
};

/**
 * DELETE - Delete an alert
 */
export const deleteAlert = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user;

    const alert = await Alert.findById(id);

    if (!alert) {
      res.status(404).json({ message: 'Alert not found' });
      return;
    }

    if (alert.userId.toString() !== userId) {
      res.status(403).json({ message: 'Not authorized to delete this alert' });
      return;
    }

    await Alert.findByIdAndDelete(id);

    res.status(200).json({ message: 'Alert deleted successfully' });
  } catch (error: any) {
    console.error('Delete alert error:', error);
    res.status(500).json({ message: 'Failed to delete alert', error: error.message });
  }
};

/**
 * GET - Fetch alert summary stats
 */
export const getAlertStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user;

    const total = await Alert.countDocuments({ userId });
    const unresolved = await Alert.countDocuments({ userId, isResolved: false });
    const high = await Alert.countDocuments({ userId, severity: 'high' });

    res.status(200).json({
      total,
      unresolved,
      high,
    });
  } catch (error: any) {
    console.error('Get alert stats error:', error);
    res.status(500).json({ message: 'Failed to fetch alert stats', error: error.message });
  }
};
