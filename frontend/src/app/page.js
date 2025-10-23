// src/app/page.js
"use client";
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import FilterBar from '@/components/FilterBar/FilterBar';
import ItemGrid from '@/components/ItemGrid/ItemGrid';
import { getItems, filterItems } from '@/services/itemService';

export default function BrowsePage() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      const data = await getItems();
      setItems(data.items);
      setFilteredItems(data.items);
      setLoading(false);
    };
    loadItems();
  }, []);

  const handleFiltersChange = async (newFilters) => {
    setFilters(newFilters);
    setLoading(true);
    
    const filtered = await filterItems(newFilters);
    setFilteredItems(filtered.items);
    setLoading(false);
  };

  const clearAllFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    setFilteredItems(items);
  };

  // calculate active filters count
  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value && value !== '' && value !== 'newest'
    ).length;
  };

  // get sort label
  const getSortLabel = () => {
    const sortLabels = {
      'newest': 'Newest first',
      'oldest': 'Oldest first', 
      'price-low': 'Price: Low to High',
      'price-high': 'Price: High to Low'
    };
    return sortLabels[filters.sortBy] || 'Newest first';
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* Header Section - Logo + title */}
        <section className={styles.headerSection}>
          <div className={styles.logoContainer}>
            <span className={styles.logo}>👶</span>
            <h1 className={styles.title}>TinyThreads</h1>
          </div>
        </section>
        
        {/* Control Section - search + filter + sort */}
        <section className={styles.controlSection}>
          <FilterBar 
            onFiltersChange={handleFiltersChange}
            onClearFilters={clearAllFilters}
            initialFilters={filters}
            itemCount={filteredItems.length}
            activeFiltersCount={getActiveFiltersCount()}
            sortLabel={getSortLabel()}
          />
        </section>

        {/* Content Section */}
        <ItemGrid 
          items={filteredItems}
          loading={loading}
          hasMore={false}
        />
      </div>
    </div>
  );
}