'use client';
import React, { useState } from 'react';
import styles from './page.module.css';
import { signIn } from 'next-auth/react';
import Navbar from '@/components/Navbar/Navbar';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // top-level form error (e.g. invalid credentials)
  const [errors, setErrors] = useState({}); // field-level validation errors

  const validateForm = () => {
    const newErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    return newErrors;
  };

  const validateField = (name, value) => {
    let message = '';

    if (name === 'email') {
      const trimmedEmail = value.trim();
      if (!trimmedEmail) {
        message = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        message = 'Please enter a valid email address';
      }
    }

    if (name === 'password') {
      if (!value) {
        message = 'Password is required';
      } else if (value.length < 8) {
        message = 'Password must be at least 8 characters';
      }
    }

    return message;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      // Use redirect:true so NextAuth sets the session cookie and redirects.
      // This ensures `useSession` in the Navbar sees the authenticated state immediately.
      await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: '/',
      });
    } catch (err) {
      // Show a user-friendly error message if sign-in fails.
      setError(
        err?.message ||
          'Unable to sign in. Please check your email and password and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <form
          className={styles.form}
          onSubmit={handleSubmit}
          noValidate
        >
          <h1 className={styles.title}>Sign in</h1>
          {error && <p className={styles.errorInline}>{error}</p>}

          <label className={styles.label}>
            Email
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
                setErrors((prev) => {
                  const next = { ...prev };
                  const message = validateField('email', value);
                  if (message) {
                    next.email = message;
                  } else {
                    delete next.email;
                  }
                  return next;
                });
              }}
              required
              placeholder="you@example.com"
            />
            {errors.email && <p className={styles.error}>{errors.email}</p>}
          </label>

          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);
                setErrors((prev) => {
                  const next = { ...prev };
                  const message = validateField('password', value);
                  if (message) {
                    next.password = message;
                  } else {
                    delete next.password;
                  }
                  return next;
                });
              }}
              required
              placeholder="Your password"
            />
            {errors.password && <p className={styles.error}>{errors.password}</p>}
          </label>

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </>
  );
}
