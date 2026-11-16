import { Router } from 'express';
import { getDashboardSummary } from '../controllers/summaryController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.use(auth);
router.get('/', getDashboardSummary);

export default router;
