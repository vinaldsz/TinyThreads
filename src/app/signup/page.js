'use client';
import React, { useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      newErrors.name = 'Full name is required';
    }

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
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message || 'Signup failed');
      // on success, navigate to login page
      router.push('/login');
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'Signup failed. Please try again.',
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
        'Something went wrong while signing you up with Google. Please try again in a moment.',
      );
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <form
          id="signupForm"
          className={styles.form}
          onSubmit={handleSubmit}
          noValidate
        >
          <h1 className={styles.title}>Create an account</h1>
          {error && <div className={styles.error}>{error}</div>}

          <label className={styles.label}>
            Full name
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.name;
                  return next;
                });
              }}
              required
              placeholder="Your name"
            />
            {errors.name && <p className={styles.errorInline}>{errors.name}</p>}
          </label>

          <label className={styles.label}>
            Email
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.email;
                  return next;
                });
              }}
              required
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className={styles.errorInline}>{errors.email}</p>
            )}
          </label>

          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.password;
                  delete next.confirmPassword;
                  return next;
                });
              }}
              required
              placeholder="Choose a strong password"
              minLength={8}
            />
            {errors.password && (
              <p className={styles.errorInline}>{errors.password}</p>
            )}
          </label>
          <label className={styles.label}>
            Confirm password
            <input
              className={styles.input}
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.confirmPassword;
                  return next;
                });
              }}
              required
              placeholder="Re-enter your password"
              minLength={8}
            />
            {errors.confirmPassword && (
              <p className={styles.errorInline}>{errors.confirmPassword}</p>
            )}
          </label>

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
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
            <span>Continue with Google</span>
          </button>

          <p className={styles.loginText}>
            Already have an account?{' '}
            <Link href="/login" className={styles.loginLink}>
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
