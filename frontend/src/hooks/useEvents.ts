import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  addEvent,
  deleteEvent,
  getUpcomingEvents,
  listenEvents,
  updateEvent,
} from '../services/firestore/events';
import type { CalendarEvent, EventInput } from '../types';

interface UseEventsReturn {
  events: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  loading: boolean;
  error: string | null;
  addEvent: (input: EventInput) => Promise<void>;
  updateEvent: (id: string, updates: Partial<EventInput>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export function useEvents(): UseEventsReturn {
  const { uid, familyId } = useAuthStore();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!familyId) { setLoading(false); return; }

    setLoading(true);
    const unsubscribe = listenEvents(
      familyId,
      (data) => { setEvents(data); setLoading(false); setError(null); },
      (err) => { setError(err.message); setLoading(false); }
    );
    return unsubscribe;
  }, [familyId]);

  const upcomingEvents = getUpcomingEvents(events, 7);

  const handleAdd = useCallback(
    async (input: EventInput) => {
      if (!familyId || !uid) return;
      await addEvent(familyId, input, uid);
    },
    [familyId, uid]
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<EventInput>) => {
      if (!familyId) return;
      await updateEvent(familyId, id, updates);
    },
    [familyId]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!familyId) return;
      await deleteEvent(familyId, id);
    },
    [familyId]
  );

  return {
    events,
    upcomingEvents,
    loading,
    error,
    addEvent: handleAdd,
    updateEvent: handleUpdate,
    deleteEvent: handleDelete,
  };
}
