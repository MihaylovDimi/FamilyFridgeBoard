import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  createFamily,
  getFamily,
  joinFamily,
  regenerateInvite,
  removeMember,
} from '../controllers/family.controller';

const router = Router();

// All family routes require authentication
router.use(requireAuth);

router.post('/', createFamily);
router.post('/join', joinFamily);
router.get('/:id', getFamily);
router.post('/:id/invite', regenerateInvite);
router.delete('/:id/members/:uid', removeMember);

export default router;
