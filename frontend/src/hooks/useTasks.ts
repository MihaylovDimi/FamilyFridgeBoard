import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  addTask,
  clearCompletedTasks,
  deleteTask,
  listenTasks,
  toggleTask,
  updateTask,
} from '../services/firestore/tasks';
import type { Task, TaskInput } from '../types';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (input: TaskInput) => Promise<void>;
  toggleTask: (id: string, completed: boolean) => Promise<void>;
  updateTask: (id: string, updates: Partial<TaskInput>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
}

export function useTasks(): UseTasksReturn {
  const { uid, familyId } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!familyId) { setLoading(false); return; }

    setLoading(true);
    const unsubscribe = listenTasks(
      familyId,
      (data) => { setTasks(data); setLoading(false); setError(null); },
      (err) => { setError(err.message); setLoading(false); }
    );
    return unsubscribe;
  }, [familyId]);

  const handleAdd = useCallback(
    async (input: TaskInput) => {
      if (!familyId || !uid) return;
      await addTask(familyId, input, uid);
    },
    [familyId, uid]
  );

  const handleToggle = useCallback(
    async (id: string, completed: boolean) => {
      if (!familyId) return;
      await toggleTask(familyId, id, completed);
    },
    [familyId]
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<TaskInput>) => {
      if (!familyId) return;
      await updateTask(familyId, id, updates);
    },
    [familyId]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!familyId) return;
      await deleteTask(familyId, id);
    },
    [familyId]
  );

  const handleClearCompleted = useCallback(async () => {
    if (!familyId) return;
    await clearCompletedTasks(familyId);
  }, [familyId]);

  return {
    tasks,
    loading,
    error,
    addTask: handleAdd,
    toggleTask: handleToggle,
    updateTask: handleUpdate,
    deleteTask: handleDelete,
    clearCompleted: handleClearCompleted,
  };
}
