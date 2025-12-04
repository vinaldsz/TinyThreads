// components/FilterBar/FilterBar.js
'use client';
import styles from './FilterBar.module.css';
import { useState } from 'react';
import Link from 'next/link';

export default function FilterBar({
  onFiltersChange,
  onClearFilters,
  initialFilters = {},
  activeFiltersCount = 0,
}) {
  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    condition: initialFilters.condition || '',
    ageRange: initialFilters.ageRange || '',
    priceRange: initialFilters.priceRange || '',
    sortBy: initialFilters.sortBy || 'newest',
    searchTerm: initialFilters.searchTerm || '',
    ...initialFilters,
  });

  const [showFilters, setShowFilters] = useState(false);

  // Filter Options
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'Clothing', label: 'Clothing' },
    { value: 'Toys', label: 'Toys' },
    { value: 'Books', label: 'Books' },
    { value: 'Gear', label: 'Baby Gear' },
    { value: 'Other', label: 'Other' },
  ];

  const conditions = [
    { value: '', label: 'Any Condition' },
    { value: 'New', label: 'New' },
    { value: 'Like-New', label: 'Like New' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'distance', label: 'Distance (Closest First)' },
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    if (onFiltersChange) {
      // normalize certain filter fields to be case-insensitive on the server
      const normalized = normalizeFilters(newFilters);
      onFiltersChange(normalized);
    }
  };

  const handleSearch = () => {
    if (onFiltersChange) {
      const normalized = normalizeFilters(filters);
      onFiltersChange(normalized);
    }
  };

  // normalize filters before sending to callbacks: trim whitespace but preserve casing
  const normalizeFilters = (raw) => {
    const f = { ...raw };
    if (f.category && typeof f.category === 'string') {
      f.category = f.category.trim();
    }
    if (f.condition && typeof f.condition === 'string') {
      f.condition = f.condition.trim();
    }
    if (f.ageRange && typeof f.ageRange === 'string') {
      f.ageRange = f.ageRange.trim();
    }
    if (f.searchTerm && typeof f.searchTerm === 'string') {
      f.searchTerm = f.searchTerm.trim();
    }
    return f;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      category: '',
      condition: '',
      ageRange: '',
      priceRange: '',
      sortBy: 'newest',
      searchTerm: '',
    };
    setFilters(clearedFilters);
    setShowFilters(false);

    if (onClearFilters) {
      onClearFilters();
    }
  };

  //generate filter button text
  const getFiltersButtonText = () => {
    if (activeFiltersCount === 0) {
      return 'Filter';
    }
    return `Filters (${activeFiltersCount})`;
  };

  return (
    <div className={styles.filterContainer}>
      {/* Search Bar */}
      <div className={styles.searchRow}>
        <div className={styles.searchInputContainer}>
          <input
            type="text"
            placeholder="Search Baby Items..."
            className={styles.searchInput}
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className={styles.controlRow}>
        <div className={styles.controlLeft}>
          <Link href="/add-listing" className={styles.addListingBtn}>
            ＋ Add listing
          </Link>
        </div>

        <div className={styles.controlRight}>
          <button
            className={`${styles.filtersButton} ${
              activeFiltersCount > 0 ? styles.filtersActive : ''
            }`}
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
          >
            <span className={styles.filtersIcon}>⚙️</span>
            {getFiltersButtonText()}
          </button>

          {activeFiltersCount > 0 && (
            <button className={styles.clearButton} onClick={handleClearFilters}>
              Clear
            </button>
          )}

          <select
            className={styles.sortSelect}
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            aria-label="Sort by"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expandable Filter Options */}
      {showFilters && (
        <div className={styles.filterOptions}>
          <div className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label className={styles.label} htmlFor="filter-category">
                Category
              </label>
              <select
                id="filter-category"
                className={styles.select}
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categories.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.label} htmlFor="filter-condition">
                Condition
              </label>
              <select
                id="filter-condition"
                className={styles.select}
                value={filters.condition}
                onChange={(e) =>
                  handleFilterChange('condition', e.target.value)
                }
              >
                {conditions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
