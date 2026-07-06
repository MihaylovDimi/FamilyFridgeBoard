import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getProfile, upsertProfile } from '../controllers/auth.controller';

const router = Router();

router.post('/profile', requireAuth, upsertProfile);
router.get('/profile', requireAuth, getProfile);

export default router;
