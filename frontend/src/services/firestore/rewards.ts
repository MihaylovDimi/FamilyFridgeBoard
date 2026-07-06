import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { LeaderboardEntry, Member, RewardInput, RewardPoint } from '../../types';

const rewardsRef = (familyId: string) =>
  collection(db, 'families', familyId, 'rewardPoints');

/** Subscribe to real-time reward points. */
export function listenRewards(
  familyId: string,
  onUpdate: (points: RewardPoint[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(rewardsRef(familyId), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const points = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as RewardPoint
      );
      onUpdate(points);
    },
    (err) => {
      console.error('Rewards listener error:', err);
      onError?.(err);
    }
  );
}

/** Award points to a family member. */
export async function awardPoints(
  familyId: string,
  input: RewardInput,
  awardedBy: string
): Promise<void> {
  await addDoc(rewardsRef(familyId), {
    memberId: input.memberId,
    memberName: input.memberName,
    points: input.points,
    reason: input.reason.trim(),
    awardedBy,
    createdAt: serverTimestamp(),
  });
}

/**
 * Aggregate reward points into a leaderboard.
 * Merges with the member list so even members with 0 points appear.
 */
export function buildLeaderboard(
  points: RewardPoint[],
  members: Member[]
): LeaderboardEntry[] {
  const totals: Record<string, number> = {};
  points.forEach((p) => {
    totals[p.memberId] = (totals[p.memberId] ?? 0) + p.points;
  });

  return members
    .map((m) => ({
      uid: m.uid,
      name: m.name,
      avatarColor: m.avatarColor,
      totalPoints: totals[m.uid] ?? 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);
}
