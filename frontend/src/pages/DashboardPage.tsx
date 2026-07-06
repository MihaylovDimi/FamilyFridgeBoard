import React, { useEffect, useState } from 'react';
import { ClockWidget } from '../components/dashboard/ClockWidget';
import { WeatherWidget } from '../components/dashboard/WeatherWidget';
import { NotesPanel } from '../components/notes/NotesPanel';
import { ShoppingPanel } from '../components/shopping/ShoppingPanel';
import { TasksPanel } from '../components/tasks/TasksPanel';
import { CalendarPanel } from '../components/calendar/CalendarPanel';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

interface DailyQuote {
  text: string;
  author: string;
}

export default function DashboardPage() {
  const { familyName, logout } = useAuthStore();
  const [quote, setQuote] = useState<DailyQuote | null>(null);

  useEffect(() => {
    api
      .get<{ success: boolean; data: DailyQuote }>('/api/quotes/daily')
      .then((r) => setQuote(r.data.data))
      .catch(() => null);
  }, []);

  return (
    <div className="dashboard-layout">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="dashboard-header">
        {/* Left: family name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '1.0625rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {familyName ?? 'Family Fridge Board'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', marginTop: 1 }}>
            Everyone's hub
          </div>
        </div>

        {/* Centre: clock */}
        <div style={{ flexShrink: 0 }}>
          <ClockWidget />
        </div>

        {/* Right: weather + sign-out */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
          <WeatherWidget />
          <button
            type="button"
            className="btn btn-icon btn-sm"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
            style={{ flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Daily quote strip ───────────────────────────────────────────── */}
      {quote && (
        <div
          style={{
            background: 'var(--bg-header)',
            padding: '5px 1rem',
            fontSize: '0.75rem',
            color: 'var(--text-disabled)',
            fontStyle: 'italic',
            textAlign: 'center',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}
        >
          "{quote.text}" — {quote.author}
        </div>
      )}

      {/* ── 2×2 Panel grid ─────────────────────────────────────────────── */}
      <div className="dashboard-grid">

        {/* Top-left: Notes */}
        <div className="dashboard-panel">
          <NotesPanel compact />
        </div>

        {/* Top-right: Shopping */}
        <div className="dashboard-panel">
          <ShoppingPanel />
        </div>

        {/* Bottom-left: Tasks */}
        <div className="dashboard-panel">
          <TasksPanel />
        </div>

        {/* Bottom-right: Calendar */}
        <div className="dashboard-panel">
          <CalendarPanel />
        </div>
      </div>
    </div>
  );
}
