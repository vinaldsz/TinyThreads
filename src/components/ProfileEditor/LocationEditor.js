'use client';
import React, { useState } from 'react';
import styles from './ProfileEditor.module.css';

export default function LocationEditor({ initialLocation }) {
  const [location, setLocation] = useState(initialLocation || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location }),
      });
      const bodyRes = await res.json();
      if (!res.ok) throw new Error(bodyRes.message || 'Save failed');
      setMessage({ type: 'success', text: 'Saved' });
      setEditing(false);
    } catch (err) {
      console.error('Location save error', err);
      setMessage({ type: 'error', text: err.message || 'Save failed' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {!editing ? (
        <>
          <div>
            {location ? (
              location
            ) : (
              <span style={{ color: '#888', fontStyle: 'italic' }}>
                Not provided
              </span>
            )}
          </div>
          <button
            aria-label="Edit location"
            title="Edit location"
            onClick={() => setEditing(true)}
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
        </>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ padding: 8 }}
          />
          <button
            onClick={save}
            disabled={saving}
            style={{ padding: '6px 10px' }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setMessage(null);
            }}
            style={{ padding: '6px 10px' }}
          >
            Cancel
          </button>
          {message ? (
            <div
              style={{ color: message.type === 'error' ? 'crimson' : 'green' }}
            >
              {message.text}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
