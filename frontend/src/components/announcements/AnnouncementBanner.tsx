import React, { useState } from 'react';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  addAnnouncement,
  deleteAnnouncement,
  listenAnnouncements,
  togglePinAnnouncement,
} from '../../services/firestore/announcements';
import { Modal, ModalBody, ModalFooter } from '../ui/Modal';
import type { Announcement } from '../../types';

export function AnnouncementBanner() {
  const { familyId, uid, displayName } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!familyId) return;
    return listenAnnouncements(familyId, setAnnouncements);
  }, [familyId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !familyId || !uid || !displayName) return;
    setSaving(true);
    try {
      await addAnnouncement(familyId, { message, pinned }, uid, displayName);
      setMessage('');
      setPinned(false);
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  if (announcements.length === 0) return null;

  return (
    <>
      {announcements.slice(0, 3).map((a) => (
        <div key={a.id} className="announce-banner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: 1 }}>
              {a.pinned && (
                <span style={{ fontSize: '0.6875rem', color: 'var(--accent-announce)', fontWeight: 500, marginRight: 6 }}>
                  📌 Pinned
                </span>
              )}
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{a.message}</span>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', marginTop: 3 }}>
                {a.fromName} · {a.createdAt?.toDate ? format(a.createdAt.toDate(), 'd MMM HH:mm') : ''}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button
                className="btn btn-icon btn-sm"
                style={{ width: 26, height: 26, minHeight: 'unset', color: a.pinned ? 'var(--accent-announce)' : undefined }}
                onClick={() => familyId && togglePinAnnouncement(familyId, a.id, !a.pinned)}
                aria-label={a.pinned ? 'Unpin' : 'Pin'}
                title={a.pinned ? 'Unpin' : 'Pin announcement'}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill={a.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </button>
              <button
                className="btn btn-icon btn-sm"
                style={{ width: 26, height: 26, minHeight: 'unset' }}
                onClick={() => familyId && deleteAnnouncement(familyId, a.id)}
                aria-label="Delete announcement"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Add announcement button */}
      <div style={{ marginBottom: 8 }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setShowModal(true)}
          style={{ fontSize: '0.8125rem' }}
        >
          + Post announcement
        </button>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New announcement">
        <form onSubmit={handleAdd}>
          <ModalBody>
            <div className="form-group">
              <label htmlFor="ann-msg">Message</label>
              <textarea
                id="ann-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share something with the family…"
                rows={3}
                maxLength={300}
                autoFocus
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                style={{ width: 18, height: 18, minHeight: 'unset', flex: 'none' }}
              />
              Pin at top
            </label>
          </ModalBody>
          <ModalFooter>
            <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !message.trim()}>
              {saving ? 'Posting…' : 'Post'}
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
