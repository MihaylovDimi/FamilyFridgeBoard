import React from 'react';
import type { NoteColor } from '../../types';

// ─── Loading Spinner ─────────────────────────────────────────────────────────

export function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <div
      className="spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100dvh',
        flexDirection: 'column',
        gap: 16,
        color: 'var(--text-muted)',
      }}
    >
      <LoadingSpinner size={32} />
      <span style={{ fontSize: '0.875rem' }}>Loading…</span>
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  color: string;
  size?: number;
}

export function Avatar({ name, color, size = 32 }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.38,
      }}
      title={name}
    >
      {initials}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: string;
  text: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = '📭', text, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <p className="empty-state-text">{text}</p>
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}

// ─── Note Colour Picker ──────────────────────────────────────────────────────

const NOTE_COLORS: { value: NoteColor; bg: string }[] = [
  { value: 'purple', bg: 'var(--note-purple)' },
  { value: 'teal',   bg: 'var(--note-teal)' },
  { value: 'coral',  bg: 'var(--note-coral)' },
  { value: 'amber',  bg: 'var(--note-amber)' },
  { value: 'green',  bg: 'var(--note-green)' },
];

interface ColorPickerProps {
  value: NoteColor;
  onChange: (color: NoteColor) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="color-picker">
      {NOTE_COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          className={`color-swatch${value === c.value ? ' selected' : ''}`}
          style={{ background: c.bg }}
          onClick={() => onChange(c.value)}
          aria-label={`${c.value} note colour`}
          aria-pressed={value === c.value}
        />
      ))}
    </div>
  );
}

// ─── Priority Badge ──────────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, string> = {
  high:   'var(--priority-high)',
  medium: 'var(--priority-medium)',
  low:    'var(--priority-low)',
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      style={{
        fontSize: '0.6875rem',
        fontWeight: 500,
        color: PRIORITY_COLORS[priority] ?? 'var(--text-muted)',
        textTransform: 'capitalize',
      }}
    >
      {priority}
    </span>
  );
}

// ─── Section Divider ─────────────────────────────────────────────────────────

export function Divider({ label }: { label?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        margin: '8px 0',
      }}
    >
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
      {label && (
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
    </div>
  );
}
