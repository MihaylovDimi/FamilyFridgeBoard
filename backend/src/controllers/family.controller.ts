import { Request, Response } from 'express';
import * as FamilyService from '../services/family.service';
import {
  ApiResponse,
  CreateFamilyBody,
  FamilyResponse,
  JoinFamilyBody,
} from '../types';

/**
 * POST /api/families
 * Create a new family. The authenticated user becomes owner.
 */
export async function createFamily(req: Request, res: Response): Promise<void> {
  const { uid, email } = req.user!;
  const { familyName, displayName } = req.body as CreateFamilyBody;

  if (!familyName?.trim() || !displayName?.trim()) {
    res.status(400).json({
      success: false,
      error: 'familyName and displayName are required.',
    } satisfies ApiResponse);
    return;
  }

  try {
    const result = await FamilyService.createFamily(
      uid,
      email ?? '',
      displayName,
      familyName
    );
    res.status(201).json({ success: true, data: result } satisfies ApiResponse<FamilyResponse>);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: (err as Error).message,
    } satisfies ApiResponse);
  }
}

/**
 * POST /api/families/join
 * Join an existing family using an invite code.
 */
export async function joinFamily(req: Request, res: Response): Promise<void> {
  const { uid, email } = req.user!;
  const { inviteCode, displayName } = req.body as JoinFamilyBody;

  if (!inviteCode?.trim() || !displayName?.trim()) {
    res.status(400).json({
      success: false,
      error: 'inviteCode and displayName are required.',
    } satisfies ApiResponse);
    return;
  }

  try {
    const result = await FamilyService.joinFamily(
      uid,
      email ?? '',
      displayName,
      inviteCode
    );
    res.status(200).json({ success: true, data: result } satisfies ApiResponse<FamilyResponse>);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: (err as Error).message,
    } satisfies ApiResponse);
  }
}

/**
 * GET /api/families/:id
 * Fetch family details and member list.
 */
export async function getFamily(req: Request, res: Response): Promise<void> {
  const { uid } = req.user!;
  const { id: familyId } = req.params;

  try {
    const result = await FamilyService.getFamily(familyId, uid);
    res.status(200).json({ success: true, data: result } satisfies ApiResponse<FamilyResponse>);
  } catch (err) {
    const message = (err as Error).message;
    const status = message.includes('not found') ? 404 : 403;
    res.status(status).json({ success: false, error: message } satisfies ApiResponse);
  }
}

/**
 * POST /api/families/:id/invite
 * Regenerate the invite code (owner only).
 */
export async function regenerateInvite(req: Request, res: Response): Promise<void> {
  const { uid } = req.user!;
  const { id: familyId } = req.params;

  try {
    const newCode = await FamilyService.regenerateInviteCode(familyId, uid);
    res.status(200).json({
      success: true,
      data: { inviteCode: newCode },
    } satisfies ApiResponse);
  } catch (err) {
    res.status(403).json({
      success: false,
      error: (err as Error).message,
    } satisfies ApiResponse);
  }
}

/**
 * DELETE /api/families/:id/members/:uid
 * Remove a member (owner only).
 */
export async function removeMember(req: Request, res: Response): Promise<void> {
  const { uid: requestingUid } = req.user!;
  const { id: familyId, uid: targetUid } = req.params;

  try {
    await FamilyService.removeMember(familyId, requestingUid, targetUid);
    res.status(200).json({
      success: true,
      data: { message: 'Member removed successfully.' },
    } satisfies ApiResponse);
  } catch (err) {
    res.status(403).json({
      success: false,
      error: (err as Error).message,
    } satisfies ApiResponse);
  }
}
