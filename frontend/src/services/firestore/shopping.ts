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
  writeBatch,
  getDocs,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { ShoppingItem, ShoppingItemInput } from '../../types';

const shoppingRef = (familyId: string) =>
  collection(db, 'families', familyId, 'shoppingItems');

/**
 * Subscribe to real-time shopping list updates.
 * Unpurchased items appear first, sorted by most recently added.
 */
export function listenShoppingItems(
  familyId: string,
  onUpdate: (items: ShoppingItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  // Firestore requires a composite index for multi-field orderBy.
  // We sort client-side to avoid index creation requirements.
  const q = query(shoppingRef(familyId), orderBy('addedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as ShoppingItem
      );
      // Unpurchased first, then purchased
      items.sort((a, b) => {
        if (a.purchased === b.purchased) return 0;
        return a.purchased ? 1 : -1;
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Shopping listener error:', err);
      onError?.(err);
    }
  );
}

/** Add an item to the shopping list. */
export async function addShoppingItem(
  familyId: string,
  input: ShoppingItemInput,
  userId: string,
  userName: string
): Promise<void> {
  await addDoc(shoppingRef(familyId), {
    name: input.name.trim(),
    quantity: input.quantity,
    purchased: false,
    addedBy: userId,
    addedByName: userName,
    addedAt: serverTimestamp(),
  });
}

/** Toggle a shopping item's purchased state. */
export async function toggleShoppingItem(
  familyId: string,
  itemId: string,
  purchased: boolean
): Promise<void> {
  await updateDoc(doc(db, 'families', familyId, 'shoppingItems', itemId), {
    purchased,
  });
}

/** Remove a single shopping item. */
export async function deleteShoppingItem(
  familyId: string,
  itemId: string
): Promise<void> {
  await deleteDoc(doc(db, 'families', familyId, 'shoppingItems', itemId));
}

/** Bulk-delete all items that are marked as purchased. */
export async function clearPurchasedItems(familyId: string): Promise<void> {
  const snapshot = await getDocs(
    query(shoppingRef(familyId), where('purchased', '==', true))
  );
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
