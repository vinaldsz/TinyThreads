'use client';
import React, { useEffect, useState } from 'react';
import styles from './ProfileEditor.module.css';

export default function ProfileEditor({ initialBio }) {
  const [bio, setBio] = useState(initialBio || '');
  const [editingBio, setEditingBio] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [bioMessage, setBioMessage] = useState(null);

  useEffect(() => {
    setBio(initialBio || '');
  }, [initialBio]);

  useEffect(() => {
    // If the page didn't provide a bio prop, fetch it from the API
    if (initialBio) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) return;
        const body = await res.json();
        if (!mounted) return;
        if (body.user && body.user.bio) setBio(body.user.bio);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialBio]);

  async function saveBio() {
    setSavingBio(true);
    setBioMessage(null);
    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio }),
      });
      const bodyRes = await res.json();
      if (!res.ok) throw new Error(bodyRes.message || 'Save failed');
      setBioMessage({ type: 'success', text: 'Saved' });
      setEditingBio(false);
    } catch (err) {
      console.error('Bio save error', err);
      setBioMessage({ type: 'error', text: err.message || 'Save failed' });
    } finally {
      setSavingBio(false);
      setTimeout(() => setBioMessage(null), 3000);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Bio editor */}
        {!editingBio ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: 1 }}>
              {bio ? (
                bio
              ) : (
                <span style={{ color: '#888', fontStyle: 'italic' }}>
                  No bio
                </span>
              )}
            </div>
            <button
              aria-label="Edit about"
              title="Edit about"
              onClick={() => setEditingBio(true)}
              className={styles.editButton}
            >
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
                  stroke="currentColor"
                  strokeWidth="0"
                  fill="currentColor"
                />
                <path
                  d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                  stroke="currentColor"
                  strokeWidth="0"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ width: '100%', minHeight: 100, padding: 8 }}
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button
                onClick={saveBio}
                disabled={savingBio}
                style={{ padding: '6px 10px' }}
              >
                {savingBio ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditingBio(false);
                  setBio(initialBio || '');
                }}
                style={{ padding: '6px 10px' }}
              >
                Cancel
              </button>
              {bioMessage ? (
                <div
                  style={{
                    color: bioMessage.type === 'error' ? 'crimson' : 'green',
                  }}
                >
                  {bioMessage.text}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
