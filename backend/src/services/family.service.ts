import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { randomInt } from 'crypto';
import { db } from './firebase.admin';
import {
  FamilyDoc,
  FamilyResponse,
  FamilySettings,
  MemberDoc,
  MemberPublic,
  UserDoc,
} from '../types';

// ─── Constants ───────────────────────────────────────────────────────────────

const INVITE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const AVATAR_COLORS = [
  '#7f77dd', '#1d9e75', '#d85a30', '#ba7517',
  '#185fa5', '#993556', '#3b6d11', '#5f5e5a',
];

const DEFAULT_SETTINGS: FamilySettings = {
  timezone: 'Europe/London',
  themeMode: 'dark',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generate a random 6-character invite code (no ambiguous chars) */
function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += INVITE_CODE_CHARS[randomInt(INVITE_CODE_CHARS.length)];
  }
  return code;
}

/** Generate an invite code that is not already in use by another family */
async function generateUniqueInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateInviteCode();
    const clash = await db
      .collection('families')
      .where('inviteCode', '==', code)
      .limit(1)
      .get();
    if (clash.empty) return code;
  }
  throw new Error('Could not generate a unique invite code. Please try again.');
}

/** Pick a deterministic avatar colour based on user index */
function pickAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Create a new family. The calling user becomes the owner and is added
 * as the first member. A unique invite code is generated.
 */
export async function createFamily(
  uid: string,
  email: string,
  displayName: string,
  familyName: string
): Promise<FamilyResponse> {
  const inviteCode = await generateUniqueInviteCode();

  // Create the family document
  const familyRef = db.collection('families').doc();
  const familyId = familyRef.id;

  const familyData: Omit<FamilyDoc, 'id'> = {
    name: familyName.trim(),
    inviteCode,
    createdAt: Timestamp.now(),
    createdBy: uid,
    settings: DEFAULT_SETTINGS,
  };

  const memberData: MemberDoc = {
    uid,
    name: displayName.trim(),
    email,
    role: 'owner',
    avatarColor: pickAvatarColor(0),
    joinedAt: Timestamp.now(),
  };

  const userDocData: UserDoc = {
    familyId,
    familyName: familyName.trim(),
    name: displayName.trim(),
    email,
  };

  // Batch write: family doc + member doc + user lookup doc
  const batch = db.batch();
  batch.set(familyRef, familyData);
  batch.set(familyRef.collection('members').doc(uid), memberData);
  batch.set(db.collection('users').doc(uid), userDocData);
  await batch.commit();

  return {
    familyId,
    familyName: familyName.trim(),
    inviteCode,
    members: [{ uid, name: displayName.trim(), role: 'owner', avatarColor: memberData.avatarColor }],
    settings: DEFAULT_SETTINGS,
  };
}

/**
 * Join an existing family using an invite code.
 * Rejects if the code is invalid or the user is already a member.
 */
export async function joinFamily(
  uid: string,
  email: string,
  displayName: string,
  inviteCode: string
): Promise<FamilyResponse> {
  // Find family by invite code
  const snapshot = await db
    .collection('families')
    .where('inviteCode', '==', inviteCode.trim().toUpperCase())
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new Error('Invalid invite code. Please check and try again.');
  }

  const familyDoc = snapshot.docs[0];
  const familyId = familyDoc.id;
  const family = familyDoc.data() as FamilyDoc;

  // Check if already a member
  const memberRef = familyDoc.ref.collection('members').doc(uid);
  const existingMember = await memberRef.get();
  if (existingMember.exists) {
    throw new Error('You are already a member of this family.');
  }

  // Determine avatar colour based on current member count
  const membersSnap = await familyDoc.ref.collection('members').get();
  const memberIndex = membersSnap.size;

  const memberData: MemberDoc = {
    uid,
    name: displayName.trim(),
    email,
    role: 'member',
    avatarColor: pickAvatarColor(memberIndex),
    joinedAt: Timestamp.now(),
  };

  const userDocData: UserDoc = {
    familyId,
    familyName: family.name,
    name: displayName.trim(),
    email,
  };

  const batch = db.batch();
  batch.set(memberRef, memberData);
  batch.set(db.collection('users').doc(uid), userDocData);
  await batch.commit();

  // Build member list for response
  const allMembers = membersSnap.docs.map((d) => {
    const m = d.data() as MemberDoc;
    return { uid: m.uid, name: m.name, role: m.role, avatarColor: m.avatarColor } as MemberPublic;
  });
  allMembers.push({ uid, name: displayName.trim(), role: 'member', avatarColor: memberData.avatarColor });

  return {
    familyId,
    familyName: family.name,
    inviteCode: family.inviteCode,
    members: allMembers,
    settings: family.settings ?? DEFAULT_SETTINGS,
  };
}

/**
 * Fetch a family's details and member list.
 * Verifies the requesting user is a member of the family.
 */
export async function getFamily(familyId: string, requestingUid: string): Promise<FamilyResponse> {
  const familyRef = db.collection('families').doc(familyId);
  const [familyDoc, membersSnap] = await Promise.all([
    familyRef.get(),
    familyRef.collection('members').get(),
  ]);

  if (!familyDoc.exists) {
    throw new Error('Family not found.');
  }

  // Ensure requester is a member
  const isMember = membersSnap.docs.some((d) => d.id === requestingUid);
  if (!isMember) {
    throw new Error('Access denied. You are not a member of this family.');
  }

  const family = familyDoc.data() as FamilyDoc;
  const members: MemberPublic[] = membersSnap.docs.map((d) => {
    const m = d.data() as MemberDoc;
    return { uid: m.uid, name: m.name, role: m.role, avatarColor: m.avatarColor };
  });

  return {
    familyId,
    familyName: family.name,
    inviteCode: family.inviteCode,
    members,
    settings: family.settings ?? DEFAULT_SETTINGS,
  };
}

/**
 * Regenerate the invite code for a family. Owner-only operation.
 */
export async function regenerateInviteCode(
  familyId: string,
  requestingUid: string
): Promise<string> {
  const memberDoc = await db
    .collection('families')
    .doc(familyId)
    .collection('members')
    .doc(requestingUid)
    .get();

  if (!memberDoc.exists || (memberDoc.data() as MemberDoc).role !== 'owner') {
    throw new Error('Only the family owner can regenerate the invite code.');
  }

  const newCode = await generateUniqueInviteCode();
  await db.collection('families').doc(familyId).update({ inviteCode: newCode });
  return newCode;
}

/**
 * Remove a member from the family. Owner-only; cannot remove self.
 */
export async function removeMember(
  familyId: string,
  requestingUid: string,
  targetUid: string
): Promise<void> {
  if (requestingUid === targetUid) {
    throw new Error('You cannot remove yourself. Use the leave family option instead.');
  }

  const requesterDoc = await db
    .collection('families')
    .doc(familyId)
    .collection('members')
    .doc(requestingUid)
    .get();

  if (!requesterDoc.exists || (requesterDoc.data() as MemberDoc).role !== 'owner') {
    throw new Error('Only the family owner can remove members.');
  }

  const batch = db.batch();
  batch.delete(db.collection('families').doc(familyId).collection('members').doc(targetUid));
  // Clear the user's family reference so they're directed to onboarding
  batch.update(db.collection('users').doc(targetUid), {
    familyId: FieldValue.delete(),
    familyName: FieldValue.delete(),
  });
  await batch.commit();
}
