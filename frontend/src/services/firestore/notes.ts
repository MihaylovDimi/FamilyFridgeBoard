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
import type { Note, NoteInput } from '../../types';

/** Path helper for the notes subcollection */
const notesRef = (familyId: string) =>
  collection(db, 'families', familyId, 'notes');

/**
 * Subscribe to real-time note updates for a family.
 * Returns the unsubscribe function — call it on component unmount.
 *
 * Notes are ordered newest first.
 */
export function listenNotes(
  familyId: string,
  onUpdate: (notes: Note[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(notesRef(familyId), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const notes = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as Note
      );
      onUpdate(notes);
    },
    (err) => {
      console.error('Notes listener error:', err);
      onError?.(err);
    }
  );
}

/**
 * Add a new note to the family's notes collection.
 */
export async function addNote(
  familyId: string,
  input: NoteInput,
  userId: string,
  userName: string
): Promise<void> {
  await addDoc(notesRef(familyId), {
    ...input,
    createdBy: userId,
    createdByName: userName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update an existing note's title, content, or colour.
 */
export async function updateNote(
  familyId: string,
  noteId: string,
  updates: Partial<NoteInput>
): Promise<void> {
  await updateDoc(doc(db, 'families', familyId, 'notes', noteId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Permanently delete a note.
 */
export async function deleteNote(
  familyId: string,
  noteId: string
): Promise<void> {
  await deleteDoc(doc(db, 'families', familyId, 'notes', noteId));
}
