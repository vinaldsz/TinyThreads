'use client';
import React, { useState } from 'react';
import styles from './page.module.css';
import { signIn } from 'next-auth/react';
import Navbar from '@/components/Navbar/Navbar';
import Link from 'next/link';
import Image from 'next/image';

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
      // Use redirect: false so we can show a friendly error on this page
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Credentials are wrong or user doesn't exist
        setError('Incorrect email or password. Please try again.');
        return;
      }

      // Successful sign-in: manually redirect to home
      if (result?.ok) {
        window.location.href = '/';
      }
    } catch {
      // Network/config issues, etc.
      setError(
        'Something went wrong while signing you in. Please try again in a moment.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn('google', {
        callbackUrl: '/',
      });
    } catch {
      setError(
        'Something went wrong while signing you in with Google. Please try again in a moment.',
      );
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
                  delete next.email;
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
                  delete next.password;
                  return next;
                });
              }}
              required
              placeholder="Your password"
            />
            {errors.password && (
              <p className={styles.error}>{errors.password}</p>
            )}
          </label>

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <button
            type="button"
            className={styles.googleButton}
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Image
              src="/google-icon.png"
              alt="Google logo"
              width={20}
              height={20}
              className={styles.googleIcon}
            />
            <span>Sign in with Google</span>
          </button>

          <p className={styles.signupText}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className={styles.signupLink}>
              Sign up here
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
