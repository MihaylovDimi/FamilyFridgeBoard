import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isToday,
} from 'date-fns';
import { useEvents } from '../../hooks/useEvents';
import { getEventsForMonth } from '../../services/firestore/events';
import { Modal, ModalBody, ModalFooter } from '../ui/Modal';
import { EmptyState, LoadingSpinner } from '../ui/index';
import type { CalendarEvent, EventInput, EventType } from '../../types';

// ─── Event dot colours ────────────────────────────────────────────────────────

const EVENT_TYPE_EMOJI: Record<EventType, string> = {
  birthday: '🎂',
  appointment: '📍',
  event: '📅',
};

// ─── Month grid ───────────────────────────────────────────────────────────────

function MonthGrid({
  year,
  month,
  events,
  onDayClick,
}: {
  year: number;
  month: number;
  events: CalendarEvent[];
  onDayClick?: (date: Date) => void;
}) {
  const firstDay = startOfMonth(new Date(year, month));
  const lastDay  = endOfMonth(firstDay);

  // Build full 6-week grid (Mon to Sun start)
  const gridStart = startOfWeek(firstDay, { weekStartsOn: 1 });
  const gridEnd   = endOfWeek(lastDay, { weekStartsOn: 1 });
  const days      = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const hasEvent = (day: Date) =>
    events.some((e) => {
      const d = e.date.toDate();
      if (e.repeatsAnnually) {
        return d.getMonth() === day.getMonth() && d.getDate() === day.getDate();
      }
      return isSameDay(d, day);
    });

  return (
    <div className="calendar-grid">
      {dayLabels.map((l) => (
        <div key={l} className="cal-day-label">{l}</div>
      ))}
      {days.map((day) => (
        <div
          key={day.toISOString()}
          className={[
            'cal-day',
            isToday(day) ? 'today' : '',
            !isSameMonth(day, firstDay) ? 'other-month' : '',
            hasEvent(day) && !isToday(day) ? 'has-event' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onDayClick?.(day)}
        >
          {format(day, 'd')}
        </div>
      ))}
    </div>
  );
}

// ─── Event Form ───────────────────────────────────────────────────────────────

function EventForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: CalendarEvent;
  onSubmit: (input: EventInput) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [type, setType] = useState<EventType>(initial?.type ?? 'event');
  const [date, setDate] = useState(
    initial ? format(initial.date.toDate(), "yyyy-MM-dd'T'HH:mm") : ''
  );
  const [repeats, setRepeats] = useState(initial?.repeatsAnnually ?? false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!date) { setError('Date is required.'); return; }
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      date: new Date(date),
      type,
      repeatsAnnually: type === 'birthday' ? true : repeats,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody>
        <div className="form-group">
          <label htmlFor="evt-title">Title</label>
          <input
            id="evt-title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            placeholder="e.g. Jake's birthday, Dentist appointment"
            autoFocus
            maxLength={100}
          />
          {error && <span className="form-error">{error}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label htmlFor="evt-type">Type</label>
            <select
              id="evt-type"
              value={type}
              onChange={(e) => {
                const t = e.target.value as EventType;
                setType(t);
                if (t === 'birthday') setRepeats(true);
              }}
            >
              <option value="event">📅 Event</option>
              <option value="birthday">🎂 Birthday</option>
              <option value="appointment">📍 Appointment</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="evt-date">Date & time</label>
            <input
              id="evt-date"
              type="datetime-local"
              value={date}
              onChange={(e) => { setDate(e.target.value); setError(''); }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="evt-desc">Description (optional)</label>
          <input
            id="evt-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Location, notes, etc."
            maxLength={200}
          />
        </div>

        {type !== 'birthday' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={repeats}
              onChange={(e) => setRepeats(e.target.checked)}
              style={{ width: 18, height: 18, minHeight: 'unset', flex: 'none' }}
            />
            Repeat every year
          </label>
        )}
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update event' : 'Add event'}
        </button>
      </ModalFooter>
    </form>
  );
}

// ─── Calendar Panel ───────────────────────────────────────────────────────────

export function CalendarPanel() {
  const { events, upcomingEvents, loading, addEvent, deleteEvent } = useEvents();

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const monthEvents = getEventsForMonth(events, viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleSubmit = async (input: EventInput) => {
    setSaving(true);
    try {
      await addEvent(input);
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Panel header */}
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            className="btn btn-icon btn-sm"
            style={{ width: 26, height: 26, minHeight: 'unset' }}
            onClick={prevMonth}
            aria-label="Previous month"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="panel-title" style={{ color: 'var(--accent-calendar)', minWidth: 100, textAlign: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {format(new Date(viewYear, viewMonth), 'MMMM yyyy')}
          </span>
          <button
            className="btn btn-icon btn-sm"
            style={{ width: 26, height: 26, minHeight: 'unset' }}
            onClick={nextMonth}
            aria-label="Next month"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <button className="btn btn-icon btn-sm" onClick={() => setShowModal(true)} aria-label="Add event">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Panel body */}
      <div className="panel-body">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Monthly grid */}
            <div style={{ marginBottom: 10 }}>
              <MonthGrid
                year={viewYear}
                month={viewMonth}
                events={monthEvents}
              />
            </div>

            {/* Upcoming events */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
              <p
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: 'var(--text-disabled)',
                  letterSpacing: '0.05em',
                  marginBottom: 6,
                }}
              >
                UPCOMING
              </p>

              {upcomingEvents.length === 0 ? (
                <EmptyState icon="📅" text="Nothing in the next 7 days." />
              ) : (
                upcomingEvents.map((evt) => (
                  <div key={evt.id} className="event-item">
                    <div className={`event-type-dot ${evt.type}`} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {EVENT_TYPE_EMOJI[evt.type]} {evt.title}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                        {format(evt.date.toDate(), 'd MMM')}
                        {evt.repeatsAnnually && ' · Annual'}
                      </span>
                    </div>
                    <button
                      className="btn btn-icon btn-sm"
                      style={{ width: 24, height: 24, minHeight: 'unset' }}
                      onClick={() => {
                        if (confirm(`Delete "${evt.title}"?`)) deleteEvent(evt.id);
                      }}
                      aria-label="Delete event"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New event">
        <EventForm
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          loading={saving}
        />
      </Modal>
    </>
  );
}
