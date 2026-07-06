import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  addShoppingItem,
  clearPurchasedItems,
  deleteShoppingItem,
  listenShoppingItems,
  toggleShoppingItem,
} from '../services/firestore/shopping';
import type { ShoppingItem, ShoppingItemInput } from '../types';

interface UseShoppingReturn {
  items: ShoppingItem[];
  loading: boolean;
  error: string | null;
  addItem: (input: ShoppingItemInput) => Promise<void>;
  toggleItem: (id: string, purchased: boolean) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearPurchased: () => Promise<void>;
}

export function useShopping(): UseShoppingReturn {
  const { uid, displayName, familyId } = useAuthStore();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!familyId) { setLoading(false); return; }

    setLoading(true);
    const unsubscribe = listenShoppingItems(
      familyId,
      (data) => { setItems(data); setLoading(false); setError(null); },
      (err) => { setError(err.message); setLoading(false); }
    );
    return unsubscribe;
  }, [familyId]);

  const addItem = useCallback(
    async (input: ShoppingItemInput) => {
      if (!familyId || !uid || !displayName) return;
      await addShoppingItem(familyId, input, uid, displayName);
    },
    [familyId, uid, displayName]
  );

  const toggleItem = useCallback(
    async (id: string, purchased: boolean) => {
      if (!familyId) return;
      await toggleShoppingItem(familyId, id, purchased);
    },
    [familyId]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      if (!familyId) return;
      await deleteShoppingItem(familyId, id);
    },
    [familyId]
  );

  const clearPurchased = useCallback(async () => {
    if (!familyId) return;
    await clearPurchasedItems(familyId);
  }, [familyId]);

  return { items, loading, error, addItem, toggleItem, deleteItem, clearPurchased };
}
