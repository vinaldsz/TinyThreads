// components/FilterBar/FilterBar.js
"use client";
import styles from './FilterBar.module.css'
import { useState } from 'react';

export default function FilterBar({ 
  onFiltersChange, 
  onClearFilters,
  initialFilters = {}, 
  itemCount = 0,
  activeFiltersCount = 0,
  sortLabel = 'Newest First'
}) {
  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    condition: initialFilters.condition || '',
    ageRange: initialFilters.ageRange || '',
    priceRange: initialFilters.priceRange || '',
    sortBy: initialFilters.sortBy || 'newest',
    searchTerm: initialFilters.searchTerm || '',
    ...initialFilters
  });

  const [showFilters, setShowFilters] = useState(false);

  // Filter Options
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'Clothing', label: 'Clothing' },
    { value: 'Toys', label: 'Toys' },
    { value: 'Books', label: 'Books' },
    { value: 'Gear', label: 'Baby Gear' },
    { value: 'Other', label: 'Other' }
  ];

  const conditions = [
    { value: '', label: 'Any Condition' },
    { value: 'New', label: 'New' },
    { value: 'Like New', label: 'Like New' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleSearch = () => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
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
      searchTerm: ''
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

  //generate result description text
  const getResultsText = () => {
    if (itemCount === 0) {
      return 'No results found';
    }
    if (itemCount === 1) {
      return `1 result · ${sortLabel}`;
    }
    return `${itemCount} results · ${sortLabel}`;
  };


  return (
    <div className={styles.filterContainer}>
      {/* Search Bar */}
      <div className={styles.searchRow}>
        <div className={styles.searchInputContainer}>
          <input
            type="text"
            placeholder="Search baby items..."
            className={styles.searchInput}
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className={styles.searchButton}
            onClick={handleSearch}
            aria-label="Search"
          >
            <span className={styles.searchIcon}>🔍</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className={styles.controlRow}>
        <div className={styles.controlLeft}>
          <button 
            className={`${styles.filtersButton} ${activeFiltersCount > 0 ? styles.filtersActive : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
          >
            <span className={styles.filtersIcon}>⚙️</span>
            {getFiltersButtonText()}
          </button>
          
          {activeFiltersCount > 0 && (
            <button 
              className={styles.clearButton}
              onClick={handleClearFilters}
            >
              Clear
            </button>
          )}
        </div>

        <div className={styles.controlRight}>
          <span className={styles.resultsText}>
            {getResultsText()}
          </span>
          
          <select 
            className={styles.sortSelect}
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            aria-label="Sort by"
          >
            {sortOptions.map(option => (
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
              <label className={styles.label}>Category</label>
              <select 
                className={styles.select}
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categories.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.label}>Condition</label>
              <select 
                className={styles.select}
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
              >
                {conditions.map(option => (
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