import React, { useState } from 'react';
import { format } from 'date-fns';
import { useNotes } from '../../hooks/useNotes';
import { Modal, ModalBody, ModalFooter } from '../ui/Modal';
import { ColorPicker, EmptyState, LoadingSpinner } from '../ui/index';
import type { Note, NoteColor, NoteInput } from '../../types';

// ─── Note Card ────────────────────────────────────────────────────────────────

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}) {
  const createdAt = note.createdAt?.toDate?.() ?? new Date();

  return (
    <div className={`note-card ${note.color}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p className="note-title">{note.title}</p>
        <div style={{ display: 'flex', gap: 4, marginLeft: 8, flexShrink: 0 }}>
          <button
            className="btn btn-icon btn-sm"
            style={{ width: 28, height: 28, minHeight: 'unset' }}
            onClick={() => onEdit(note)}
            aria-label="Edit note"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            className="btn btn-icon btn-sm"
            style={{ width: 28, height: 28, minHeight: 'unset' }}
            onClick={() => onDelete(note.id)}
            aria-label="Delete note"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>
      {note.content && <p className="note-content">{note.content}</p>}
      <p className="note-meta">
        {note.createdByName} · {format(createdAt, 'd MMM HH:mm')}
      </p>
    </div>
  );
}

// ─── Note Form ────────────────────────────────────────────────────────────────

function NoteForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: NoteInput;
  onSubmit: (input: NoteInput) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [color, setColor] = useState<NoteColor>(initial?.color ?? 'purple');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    onSubmit({ title: title.trim(), content: content.trim(), color });
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody>
        <div className="form-group">
          <label htmlFor="note-title">Title</label>
          <input
            id="note-title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            placeholder="What's this note about?"
            autoFocus
            maxLength={100}
          />
          {error && <span className="form-error">{error}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="note-content">Details (optional)</label>
          <textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Any extra details…"
            rows={3}
            maxLength={500}
          />
        </div>
        <div className="form-group">
          <label>Colour</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update note' : 'Add note'}
        </button>
      </ModalFooter>
    </form>
  );
}

// ─── Notes Panel ─────────────────────────────────────────────────────────────

interface NotesPanelProps {
  compact?: boolean; // true = dashboard panel mode (smaller)
}

export function NotesPanel({ compact = false }: NotesPanelProps) {
  const { notes, loading, addNote, updateNote, deleteNote } = useNotes();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditTarget(null); setShowModal(true); };
  const openEdit = (note: Note) => { setEditTarget(note); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditTarget(null); };

  const handleSubmit = async (input: NoteInput) => {
    setSaving(true);
    try {
      if (editTarget) {
        await updateNote(editTarget.id, input);
      } else {
        await addNote(input);
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    await deleteNote(id);
  };

  return (
    <>
      {/* Panel header */}
      <div className="panel-header">
        <span className="panel-title" style={{ color: 'var(--accent-notes)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Notes
          {notes.length > 0 && (
            <span className="badge badge-purple" style={{ marginLeft: 4 }}>{notes.length}</span>
          )}
        </span>
        <button className="btn btn-icon btn-sm" onClick={openAdd} aria-label="Add note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Panel body */}
      <div className="panel-body">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
            <LoadingSpinner />
          </div>
        ) : notes.length === 0 ? (
          <EmptyState icon="📝" text="No notes yet. Tap + to add one." />
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editTarget ? 'Edit note' : 'New note'}
      >
        <NoteForm
          initial={editTarget ?? undefined}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          loading={saving}
        />
      </Modal>
    </>
  );
}
