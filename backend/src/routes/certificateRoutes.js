import { Router } from 'express';
import { generateCertificate, getCertificate } from '../controllers/certificateController.js';
import verifyFirebaseToken from '../middleware/auth.js';

const router = Router();

// Generate new certificate
router.post('/', verifyFirebaseToken, generateCertificate);

// Get existing certificate
router.get('/:pledgeId', verifyFirebaseToken, getCertificate);

export default router;