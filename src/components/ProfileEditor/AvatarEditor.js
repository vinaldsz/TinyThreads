'use client';
import React, { useRef, useState } from 'react';
import profileStyles from '../../app/profile/profile.module.css';

export default function AvatarEditor({ initialAvatar }) {
  const [avatar, setAvatar] = useState(initialAvatar || '');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const inputRef = useRef(null);

  function openFilePicker() {
    if (inputRef.current) inputRef.current.click();
  }

  async function onFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // Basic client-side validation
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Upload the raw file with FormData to our server upload route
    const objectUrl = URL.createObjectURL(file);
    setAvatar(objectUrl); // optimistic preview
    setUploading(true);
    try {
      const form = new FormData();
      form.append('avatar', file, file.name);

      const res = await fetch('/api/uploads/avatar/upload', {
        method: 'POST',
        body: form,
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Upload failed');

      // Prefer explicit publicUrl from server; fallback to returned user.avatarUrl
      const publicUrl =
        body.publicUrl || (body.user && body.user.avatarUrl) || body.imageUrl;
      if (publicUrl) setAvatar(publicUrl);
      setMessage({ type: 'success', text: 'Avatar updated' });
    } catch (err) {
      console.error('Avatar upload error', err);
      setMessage({ type: 'error', text: err.message || 'Upload failed' });
    } finally {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        // ignore
      }
      setUploading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="avatar" className={profileStyles.avatar} />
        ) : (
          <div className={profileStyles.avatar} aria-hidden />
        )}

        <button
          onClick={openFilePicker}
          aria-label="Change avatar"
          title="Change avatar"
          style={{
            position: 'absolute',
            right: -6,
            bottom: -6,
            background: 'white',
            borderRadius: '50%',
            border: '1px solid rgba(0,0,0,0.08)',
            padding: 6,
            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            cursor: 'pointer',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M12 5a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2V6a1 1 0 0 1 1-1h2z"
              fill="#4B5563"
            />
            <path d="M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" fill="#374151" />
          </svg>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {message ? (
        <div style={{ color: message.type === 'error' ? 'crimson' : 'green' }}>
          {message.text}
        </div>
      ) : uploading ? (
        <div style={{ color: '#666' }}>Uploading…</div>
      ) : null}
    </div>
  );
}
