// components/FilterBar/FilterBar.js
'use client';
import styles from './FilterBar.module.css';
import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';


export default function FilterBar({
  onFiltersChange,
  onClearFilters,
  initialFilters = {},
  activeFiltersCount = 0,
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    condition: initialFilters.condition || '',
    size:initialFilters.size || '',
    ageRange: initialFilters.ageRange || '',
    priceRange: initialFilters.priceRange || '',
    sortBy: initialFilters.sortBy || 'newest',
    searchTerm: initialFilters.searchTerm || '',
    availability: initialFilters.availability || 'available', 
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

  const sizeOptions = [
    { value: '', label: 'All Sizes' },
    { value: 'NB', label: 'Newborn (0-3M)' },
    { value: '3M', label: '3 Months' },
    { value: '6M', label: '6 Months' },
    { value: '9M', label: '9 Months' },
    { value: '12M', label: '12 Months' },
    { value: '18M', label: '18 Months' },
    { value: '24M', label: '24 Months' },
    { value: '2T', label: '2T (2-3 years)' },
    { value: '3T', label: '3T (3-4 years)' },
    { value: '4T', label: '4T (4-5 years)' }
  ];

  const ageRangeOptions = [
    { value: '', label: 'All Ages' },
    { value: '0-6M', label: '0-6 Months' },
    { value: '6-12M', label: '6-12 Months' },
    { value: '1-2Y', label: '1-2 Years' },
    { value: '2-3Y', label: '2-3 Years' },
    { value: '3-5Y', label: '3-5 Years' }
  ];

  // add status options 
  const availabilityOptions = [
    { value: 'available', label: 'Available' },
    { value: 'sold', label: 'Sold' },
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
    if (f.size && typeof f.size === 'string'){
      f.size = f.size.trim();
    }
    if (f.ageRange && typeof f.ageRange === 'string') {
      f.ageRange = f.ageRange.trim();
    }
    if (f.searchTerm && typeof f.searchTerm === 'string') {
      f.searchTerm = f.searchTerm.trim();
    }
    if (f.availabilityOptions && typeof f.availabilityOptions === 'string') {
      f.availabilityOptions = f.availabilityOptions.trim();
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
      size:'',
      ageRange: '',
      priceRange: '',
      sortBy: 'newest',
      searchTerm: '',
      availability: 'available',//default to available
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

  //handle add listing click with authentication check (placeholder)
  const handleAddListingClick = (e) => {
    if (!session) {
      e.preventDefault();
      router.push('/login');
    }
    // If user is logged in, let the Link component handle navigation normally
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
          {session ? (
            // User is logged in, show normal link
          <Link href="/add-listing" className={styles.addListingBtn}>
            ＋ Add listing
          </Link>
          ) : (
          // User is not logged in, intercept click to redirect to login
          <button 
            className={styles.addListingBtn} 
            onClick={()=> router.push('/login')}
            type = "button"
          >
            ＋ Add listing
          </button>
          )}
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

            <div className={styles.filterGroup}>
              <label className={styles.label} htmlFor="filter-size">
                Size
              </label>
              <select
                id="filter-size"
                className={styles.select}
                value={filters.size}
                onChange={(e) => handleFilterChange('size', e.target.value)}
              >
                {sizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Age Range Filter */}
            <div className={styles.filterGroup}>
              <label className={styles.label} htmlFor="filter-ageRange">
                Age Range
              </label>
              <select
                id="filter-ageRange"
                className={styles.select}
                value={filters.ageRange}
                onChange={(e) => handleFilterChange('ageRange', e.target.value)}
              >
                {ageRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.label} htmlFor="filter-availability">
                Availability
              </label>
              <select
                id="filter-availability"
                className={styles.select}
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
              >
                {availabilityOptions.map((option) => (
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
