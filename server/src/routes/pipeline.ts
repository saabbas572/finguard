import { Router } from 'express';
import { evaluateTransaction } from '../controllers/pipelineController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);
router.post('/evaluate', evaluateTransaction);

export default router;
