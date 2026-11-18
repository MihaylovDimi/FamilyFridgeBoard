import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * Limits invite-code attempts. Keyed by the authenticated user, so it must be
 * mounted AFTER requireAuth. No IP fallback is needed because the route is
 * already behind authentication.
 */
export const joinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.user!.uid,
  message: {
    success: false,
    error: 'Too many invite code attempts. Please wait 15 minutes and try again.',
  },
});