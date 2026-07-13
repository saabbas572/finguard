import { Router } from 'express';
import { evaluateTransaction, evaluateIntegrationTransactions } from '../controllers/pipelineController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);
router.post('/evaluate', evaluateTransaction);
router.post('/evaluate-integration', evaluateIntegrationTransactions);

export default router;
