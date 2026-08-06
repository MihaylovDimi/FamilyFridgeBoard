import { useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import { setupPushNotifications } from '../services/notifications';
import type { Member } from '../types';

/**
 * Subscribes to the members subcollection of the current family.
 * Updates the global Zustand store so any component can access members.
 * Should be mounted once at the App level after authentication.
 */
export function useFamily(): void {
  const { familyId, uid, setMembers } = useAuthStore();

  useEffect(() => {
    if (!familyId) return;
    // Set up push notifications once we have a family and user
    if (uid) {
      setupPushNotifications(familyId, uid);
    }

    const membersRef = collection(db, 'families', familyId, 'members');
    const unsubscribe = onSnapshot(membersRef, (snapshot) => {
      const members = snapshot.docs.map(
        (d) => ({ uid: d.id, ...d.data() }) as Member
      );
      setMembers(members);
    });

    return unsubscribe;
  }, [familyId, setMembers]);
}
