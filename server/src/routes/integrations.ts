import { Router } from 'express';
import * as integrationController from '../controllers/integrationController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(protect);

// Get all integrations for the user
router.get('/', integrationController.getIntegrations);

// Get active integration
router.get('/active', integrationController.getActiveIntegration);

// Save (create or update) integration
router.post('/', integrationController.saveIntegration);

// Test connection
router.post('/test', integrationController.testConnection);

// Delete integration
router.delete('/:integrationId', integrationController.deleteIntegration);

export default router;
