import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import type { FamilyResponse } from '../types';

type Tab = 'create' | 'join';

export default function OnboardingPage() {
  const { uid, displayName, setFamily, logout } = useAuthStore();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('create');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [nameOverride, setNameOverride] = useState(displayName ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!familyName.trim()) { setError('Please enter a family name.'); return; }
    if (!nameOverride.trim()) { setError('Please enter your name.'); return; }

    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; data: FamilyResponse }>(
        '/api/families',
        { familyName: familyName.trim(), displayName: nameOverride.trim() }
      );
      const { familyId, familyName: fn } = res.data.data;
      setFamily(familyId, fn);
      navigate('/', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!inviteCode.trim()) { setError('Please enter the invite code.'); return; }
    if (!nameOverride.trim()) { setError('Please enter your name.'); return; }

    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; data: FamilyResponse }>(
        '/api/families/join',
        { inviteCode: inviteCode.trim().toUpperCase(), displayName: nameOverride.trim() }
      );
      const { familyId, familyName } = res.data.data;
      setFamily(familyId, familyName);
      navigate('/', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🏡</div>
        <h1 className="auth-title">Set up your family</h1>
        <p className="auth-subtitle">Create a new family board or join an existing one.</p>

        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-lg)',
            padding: 4,
            marginBottom: 24,
          }}
        >
          {(['create', 'join'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setError(''); }}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.9rem',
                background: tab === t ? 'var(--bg-card)' : 'transparent',
                color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                transition: 'background var(--transition)',
              }}
            >
              {t === 'create' ? '✨ Create family' : '🔑 Join family'}
            </button>
          ))}
        </div>

        {error && (
          <div
            style={{
              background: 'var(--note-bg-coral)',
              borderLeft: '3px solid var(--color-error)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              marginBottom: 16,
              fontSize: '0.875rem',
              color: 'var(--color-error)',
            }}
          >
            {error}
          </div>
        )}

        {tab === 'create' ? (
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="ob-family-name">Family name</label>
              <input
                id="ob-family-name"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="e.g. The Smith Family"
                autoFocus
                maxLength={60}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label htmlFor="ob-display-name">Your name</label>
              <input
                id="ob-display-name"
                value={nameOverride}
                onChange={(e) => setNameOverride(e.target.value)}
                placeholder="e.g. Mum, Dad, Sarah…"
                maxLength={40}
              />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Creating…' : 'Create family board'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin}>
            <div className="form-group">
              <label htmlFor="ob-invite-code">Invite code</label>
              <input
                id="ob-invite-code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. A3BX7F"
                maxLength={6}
                style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '1.1rem' }}
                autoFocus
              />
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label htmlFor="ob-join-name">Your name</label>
              <input
                id="ob-join-name"
                value={nameOverride}
                onChange={(e) => setNameOverride(e.target.value)}
                placeholder="e.g. Jake, Emma…"
                maxLength={40}
              />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Joining…' : 'Join family board'}
            </button>
          </form>
        )}

        {/* Sign out link */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Wrong account?{' '}
          <button
            type="button"
            onClick={logout}
            style={{ background: 'none', border: 'none', color: 'var(--accent-calendar)', cursor: 'pointer', fontSize: 'inherit' }}
          >
            Sign out
          </button>
        </p>
      </div>
    </div>
  );
}
