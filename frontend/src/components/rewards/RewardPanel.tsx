import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { awardPoints, buildLeaderboard, listenRewards } from '../../services/firestore/rewards';
import { Modal, ModalBody, ModalFooter } from '../ui/Modal';
import { Avatar } from '../ui/index';
import type { LeaderboardEntry, RewardPoint } from '../../types';

export function RewardPanel() {
  const { familyId, uid, members } = useAuthStore();
  const [points, setPoints] = useState<RewardPoint[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [targetUid, setTargetUid] = useState('');
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!familyId) return;
    return listenRewards(familyId, (data) => {
      setPoints(data);
    });
  }, [familyId]);

  useEffect(() => {
    setLeaderboard(buildLeaderboard(points, members));
  }, [points, members]);

  const handleAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyId || !uid || !targetUid) return;
    const member = members.find((m) => m.uid === targetUid);
    if (!member) return;
    setSaving(true);
    try {
      await awardPoints(
        familyId,
        { memberId: targetUid, memberName: member.name, points: amount, reason },
        uid
      );
      setReason('');
      setAmount(1);
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const otherMembers = members.filter((m) => m.uid !== uid);

  return (
    <>
      <div className="panel-header">
        <span className="panel-title" style={{ color: 'var(--accent-rewards)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
          Leaderboard
        </span>
        {otherMembers.length > 0 && (
          <button className="btn btn-icon btn-sm" onClick={() => setShowModal(true)} aria-label="Award points">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        )}
      </div>

      <div className="panel-body">
        {leaderboard.map((entry, i) => (
          <div
            key={entry.uid}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 4px',
              borderBottom: i < leaderboard.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            <span style={{ fontSize: '1rem', width: 22, textAlign: 'center', flexShrink: 0 }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
            </span>
            <Avatar name={entry.name} color={entry.avatarColor} size={28} />
            <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{entry.name}</span>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: i === 0 ? 'var(--accent-rewards)' : 'var(--text-secondary)',
              }}
            >
              {entry.totalPoints} pts
            </span>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Award points">
        <form onSubmit={handleAward}>
          <ModalBody>
            <div className="form-group">
              <label htmlFor="award-to">Award to</label>
              <select
                id="award-to"
                value={targetUid}
                onChange={(e) => setTargetUid(e.target.value)}
              >
                <option value="">Select a family member…</option>
                {otherMembers.map((m) => (
                  <option key={m.uid} value={m.uid}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="award-pts">Points</label>
              <input
                id="award-pts"
                type="number"
                min={1}
                max={100}
                value={amount}
                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="award-reason">Reason</label>
              <input
                id="award-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Tidied the kitchen"
                maxLength={100}
                autoFocus
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !targetUid || !reason.trim()}>
              {saving ? 'Awarding…' : 'Award ⭐'}
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
