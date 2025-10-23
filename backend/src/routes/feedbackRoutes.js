import { Router } from 'express';
import { createFeedback, getFeedback, deleteFeedback } from '../controllers/feedbackController.js';
import verifyFirebaseToken from '../middleware/auth.js';
import verifyAdmin from '../middleware/admin.js';

const router = Router();

// Public route to get feedback
router.get('/', getFeedback);

// Protected route to submit feedback
router.post('/', verifyFirebaseToken, createFeedback);

// Admin-only route to delete feedback
router.delete('/:id', verifyFirebaseToken, verifyAdmin, deleteFeedback);

export default router;