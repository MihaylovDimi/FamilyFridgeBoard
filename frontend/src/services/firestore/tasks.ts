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
  Timestamp,
  writeBatch,
  getDocs,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Task, TaskInput } from '../../types';

const tasksRef = (familyId: string) =>
  collection(db, 'families', familyId, 'tasks');

/**
 * Subscribe to real-time task updates.
 * Client sorts: incomplete first, then by due date ascending.
 */
export function listenTasks(
  familyId: string,
  onUpdate: (tasks: Task[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(tasksRef(familyId), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as Task
      );
      // Incomplete tasks first; within incomplete, soonest due date first
      tasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.seconds - b.dueDate.seconds;
      });
      onUpdate(tasks);
    },
    (err) => {
      console.error('Tasks listener error:', err);
      onError?.(err);
    }
  );
}

/** Create a new task. */
export async function addTask(
  familyId: string,
  input: TaskInput,
  userId: string
): Promise<void> {
  await addDoc(tasksRef(familyId), {
    title: input.title.trim(),
    description: input.description.trim(),
    assignedTo: input.assignedTo,
    assignedToName: input.assignedToName,
    dueDate: input.dueDate ? Timestamp.fromDate(input.dueDate) : null,
    completed: false,
    priority: input.priority,
    createdBy: userId,
    createdAt: serverTimestamp(),
  });
}

/** Mark a task complete or incomplete. */
export async function toggleTask(
  familyId: string,
  taskId: string,
  completed: boolean
): Promise<void> {
  await updateDoc(doc(db, 'families', familyId, 'tasks', taskId), {
    completed,
  });
}

/** Update task fields (title, description, due date, priority, assignee). */
export async function updateTask(
  familyId: string,
  taskId: string,
  updates: Partial<TaskInput>
): Promise<void> {
  const payload: Record<string, unknown> = { ...updates };
  if (updates.dueDate !== undefined) {
    payload.dueDate = updates.dueDate ? Timestamp.fromDate(updates.dueDate) : null;
  }
  await updateDoc(doc(db, 'families', familyId, 'tasks', taskId), payload);
}

/** Delete a task. */
export async function deleteTask(
  familyId: string,
  taskId: string
): Promise<void> {
  await deleteDoc(doc(db, 'families', familyId, 'tasks', taskId));
}

/** Bulk-delete all completed tasks. */
export async function clearCompletedTasks(familyId: string): Promise<void> {
  const snapshot = await getDocs(
    query(tasksRef(familyId), where('completed', '==', true))
  );
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

/** Returns true if a task's due date is in the past and it is not complete. */
export function isOverdue(task: Task): boolean {
  if (task.completed || !task.dueDate) return false;
  return task.dueDate.toDate() < new Date();
}
