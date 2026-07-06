import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  doc,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Announcement, AnnouncementInput } from '../../types';

const announcementsRef = (familyId: string) =>
  collection(db, 'families', familyId, 'announcements');

/** Subscribe to real-time announcement updates. Pinned first, then newest. */
export function listenAnnouncements(
  familyId: string,
  onUpdate: (items: Announcement[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(announcementsRef(familyId), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as Announcement
      );
      // Pinned items bubble to the top
      items.sort((a, b) => {
        if (a.pinned === b.pinned) return 0;
        return a.pinned ? -1 : 1;
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Announcements listener error:', err);
      onError?.(err);
    }
  );
}

/** Post a new announcement. */
export async function addAnnouncement(
  familyId: string,
  input: AnnouncementInput,
  userId: string,
  userName: string
): Promise<void> {
  await addDoc(announcementsRef(familyId), {
    message: input.message.trim(),
    from: userId,
    fromName: userName,
    pinned: input.pinned,
    createdAt: serverTimestamp(),
  });
}

/** Toggle pinned state. */
export async function togglePinAnnouncement(
  familyId: string,
  id: string,
  pinned: boolean
): Promise<void> {
  await updateDoc(doc(db, 'families', familyId, 'announcements', id), {
    pinned,
  });
}

/** Delete an announcement. */
export async function deleteAnnouncement(
  familyId: string,
  id: string
): Promise<void> {
  await deleteDoc(doc(db, 'families', familyId, 'announcements', id));
}
