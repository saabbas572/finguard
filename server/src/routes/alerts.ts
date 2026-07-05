/**
 * Alerts Routes
 * =============
 * Routes for alert management
 */

import { Router } from 'express';
import {
  getAlerts,
  resolveAlert,
  deleteAlert,
  getAlertStats,
} from '../controllers/alertsController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

/**
 * GET /api/alerts
 * Get all alerts for the logged-in user
 * Optional query params: isResolved, severity, sort
 */
router.get('/', getAlerts);

/**
 * GET /api/alerts/stats
 * Get alert summary statistics
 */
router.get('/stats', getAlertStats);

/**
 * PATCH /api/alerts/:id/resolve
 * Mark an alert as resolved
 */
router.patch('/:id/resolve', resolveAlert);

/**
 * DELETE /api/alerts/:id
 * Delete an alert
 */
router.delete('/:id', deleteAlert);

export default router;
