import { Request, Response } from 'express';
import { db } from '../services/firebase.admin';
import { ApiResponse, UpdateProfileBody, UserDoc } from '../types';

/**
 * POST /api/auth/profile
 *
 * Called by the frontend immediately after a successful Firebase login to
 * create or update the user's display name in the `users` collection.
 * If the user already has a familyId, it is preserved.
 */
export async function upsertProfile(req: Request, res: Response): Promise<void> {
  const { uid, email } = req.user!;
  const { displayName } = req.body as UpdateProfileBody;

  if (!displayName?.trim()) {
    res.status(400).json({
      success: false,
      error: 'displayName is required.',
    } satisfies ApiResponse);
    return;
  }

  const userRef = db.collection('users').doc(uid);
  const existing = await userRef.get();

  if (existing.exists) {
    // Update name only — preserve existing familyId
    await userRef.update({ name: displayName.trim() });
    res.status(200).json({
      success: true,
      data: { ...(existing.data() as UserDoc), name: displayName.trim() },
    } satisfies ApiResponse<UserDoc>);
  } else {
    // First time — create a user doc without familyId (onboarding will set it)
    const newDoc: Partial<UserDoc> = {
      name: displayName.trim(),
      email: email ?? '',
    };
    await userRef.set(newDoc);
    res.status(201).json({
      success: true,
      data: newDoc,
    } satisfies ApiResponse);
  }
}

/**
 * GET /api/auth/profile
 *
 * Returns the current user's document including their familyId (if any).
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
  const { uid } = req.user!;
  const userSnap = await db.collection('users').doc(uid).get();

  if (!userSnap.exists) {
    res.status(404).json({
      success: false,
      error: 'User profile not found. Call POST /api/auth/profile first.',
    } satisfies ApiResponse);
    return;
  }

  res.status(200).json({
    success: true,
    data: { uid, ...userSnap.data() },
  } satisfies ApiResponse);
}
