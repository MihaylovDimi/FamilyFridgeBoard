import { Request, Response, NextFunction } from 'express';
import { auth } from '../services/firebase.admin';
import { ApiResponse } from '../types';

/**
 * Express middleware that validates the Firebase ID token from the
 * Authorization header. Attaches the decoded user to `req.user`.
 *
 * Expected header format:  Authorization: Bearer <firebase-id-token>
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Missing or malformed Authorization header. Expected: Bearer <token>',
    } satisfies ApiResponse);
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = await auth.verifyIdToken(token);

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please re-authenticate.',
    } satisfies ApiResponse);
  }
}
