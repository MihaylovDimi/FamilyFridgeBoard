import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  addNote,
  deleteNote,
  listenNotes,
  updateNote,
} from '../services/firestore/notes';
import type { Note, NoteInput } from '../types';

interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  addNote: (input: NoteInput) => Promise<void>;
  updateNote: (id: string, updates: Partial<NoteInput>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export function useNotes(): UseNotesReturn {
  const { uid, displayName, familyId } = useAuthStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = listenNotes(
      familyId,
      (data) => {
        setNotes(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [familyId]);

  const handleAdd = useCallback(
    async (input: NoteInput) => {
      if (!familyId || !uid || !displayName) return;
      await addNote(familyId, input, uid, displayName);
    },
    [familyId, uid, displayName]
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<NoteInput>) => {
      if (!familyId) return;
      await updateNote(familyId, id, updates);
    },
    [familyId]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!familyId) return;
      await deleteNote(familyId, id);
    },
    [familyId]
  );

  return {
    notes,
    loading,
    error,
    addNote: handleAdd,
    updateNote: handleUpdate,
    deleteNote: handleDelete,
  };
}
