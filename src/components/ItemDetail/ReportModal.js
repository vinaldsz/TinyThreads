'use client';

import { useState } from 'react';
import styles from './ReportModal.module.css';

const REPORT_REASONS = [
  { value: 'suspicious', label: 'Suspicious Activity' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'spam', label: 'Spam or Scam' },
  { value: 'fraud', label: 'Fraudulent Listing' },
  { value: 'offensive', label: 'Offensive Language' },
  { value: 'misleading', label: 'Misleading Information' },
  { value: 'other', label: 'Other' },
];

export default function ReportModal({
  itemTitle,
  sellerName,
  onClose,
  onSubmit,
}) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      alert('Please select a reason for reporting');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ reason, details });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Report Listing</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.description}>
            Help us keep TinyThreads safe. Please let us know why you&apos;re
            reporting <strong>&ldquo;{itemTitle}&rdquo;</strong> from{' '}
            <strong>{sellerName}</strong>.
          </p>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="reason" className={styles.label}>
                Reason for Report <span className={styles.required}>*</span>
              </label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={styles.select}
                disabled={isSubmitting}
                required
              >
                <option value="">Select a reason...</option>
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="details" className={styles.label}>
                Additional Details (Optional)
              </label>
              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className={styles.textarea}
                placeholder="Provide any additional information that would help us investigate..."
                maxLength={500}
                disabled={isSubmitting}
                rows={5}
              />
              <span className={styles.charCount}>{details.length}/500</span>
            </div>

            <div className={styles.notice}>
              <p>
                <strong>Note:</strong> All reports are reviewed by our team.
                False or malicious reports may result in account suspension.
              </p>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelBtn}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting || !reason}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
