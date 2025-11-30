'use client';
import React from 'react';
import styles from './Pagination.module.css';

export default function Pagination({
  page = 1,
  total = 0,
  limit = 12,
  onPageChange,
  maxPagesToShow = 7,
}) {
  if (!onPageChange) return null;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const half = Math.floor(maxPagesToShow / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(totalPages, start + maxPagesToShow - 1);
  if (end - start + 1 < maxPagesToShow)
    start = Math.max(1, end - maxPagesToShow + 1);

  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={styles.control}
        onClick={() => onPageChange(1)}
        disabled={page === 1}
        aria-label="First page"
      >
        « First
      </button>

      <button
        type="button"
        className={styles.control}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
      >
        ‹ Prev
      </button>

      {start > 1 && (
        <button
          type="button"
          className={styles.ellipsis}
          onClick={() => onPageChange(start - 1)}
        >
          …
        </button>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={p === page ? styles.active : styles.page}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <button
          type="button"
          className={styles.ellipsis}
          onClick={() => onPageChange(end + 1)}
        >
          …
        </button>
      )}

      <button
        type="button"
        className={styles.control}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        Next ›
      </button>

      <button
        type="button"
        className={styles.control}
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        aria-label="Last page"
      >
        Last »
      </button>
    </nav>
  );
}
