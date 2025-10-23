import { Router } from 'express';
import { createPledge, getPledges, getPledgeCount } from '../controllers/pledgeController.js';
import verifyFirebaseToken from '../middleware/auth.js';

const router = Router();

router.post('/', verifyFirebaseToken, createPledge);
router.get('/', getPledges);
router.get('/count', getPledgeCount);

export default router;