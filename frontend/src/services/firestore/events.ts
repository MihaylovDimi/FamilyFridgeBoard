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
} from 'firebase/firestore';
import { db } from '../firebase';
import type { CalendarEvent, EventInput } from '../../types';

const eventsRef = (familyId: string) =>
  collection(db, 'families', familyId, 'events');

/**
 * Subscribe to real-time calendar event updates.
 * Events are ordered by date ascending.
 */
export function listenEvents(
  familyId: string,
  onUpdate: (events: CalendarEvent[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(eventsRef(familyId), orderBy('date', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const events = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as CalendarEvent
      );
      onUpdate(events);
    },
    (err) => {
      console.error('Events listener error:', err);
      onError?.(err);
    }
  );
}

/** Create a new calendar event. */
export async function addEvent(
  familyId: string,
  input: EventInput,
  userId: string
): Promise<void> {
  await addDoc(eventsRef(familyId), {
    title: input.title.trim(),
    description: input.description.trim(),
    date: Timestamp.fromDate(input.date),
    type: input.type,
    repeatsAnnually: input.repeatsAnnually,
    createdBy: userId,
    createdAt: serverTimestamp(),
  });
}

/** Update an existing event. */
export async function updateEvent(
  familyId: string,
  eventId: string,
  updates: Partial<EventInput>
): Promise<void> {
  const payload: Record<string, unknown> = { ...updates };
  if (updates.date) {
    payload.date = Timestamp.fromDate(updates.date);
  }
  await updateDoc(doc(db, 'families', familyId, 'events', eventId), payload);
}

/** Delete an event. */
export async function deleteEvent(
  familyId: string,
  eventId: string
): Promise<void> {
  await deleteDoc(doc(db, 'families', familyId, 'events', eventId));
}

/**
 * Get events for a specific calendar month.
 * Handles annually repeating events (birthdays) by projecting them
 * into the current year.
 */
export function getEventsForMonth(
  events: CalendarEvent[],
  year: number,
  month: number // 0-indexed
): CalendarEvent[] {
  return events.filter((event) => {
    const eventDate = event.date.toDate();

    if (event.repeatsAnnually) {
      // Show annual events in their month regardless of year
      return eventDate.getMonth() === month;
    }

    return (
      eventDate.getFullYear() === year &&
      eventDate.getMonth() === month
    );
  });
}

/**
 * Get events occurring in the next N days (for the dashboard strip).
 * Includes annually repeating events within the window.
 */
export function getUpcomingEvents(
  events: CalendarEvent[],
  days = 7
): CalendarEvent[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return events
    .filter((event) => {
      const rawDate = event.date.toDate();

      if (event.repeatsAnnually) {
        // Project annual event into this year for comparison
        const thisYear = new Date(
          now.getFullYear(),
          rawDate.getMonth(),
          rawDate.getDate()
        );
        return thisYear >= now && thisYear <= cutoff;
      }

      return rawDate >= now && rawDate <= cutoff;
    })
    .sort((a, b) => a.date.seconds - b.date.seconds);
}
