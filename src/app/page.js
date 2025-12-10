// src/app/page.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';
import FilterBar from '@/components/FilterBar/FilterBar';
import ItemGrid from '@/components/ItemGrid/ItemGrid';
import { getItems /* filterItems */ } from '@/services/itemService';
import useItemsPerPage from '@/hooks/useItemsPerPage';
import Pagination from '@/components/Pagination/Pagination';

export default function BrowsePage() {
  const { data: session } = useSession();
  const sessionUserId = session?.user?.id ? String(session.user.id) : null;

  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    availability: 'available',
    hideMyListings: true,
  });
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  // default rowsPerPage is 3 in the hook (3 rows × 3 columns = 9 items)
  const itemsPerPage = useItemsPerPage();

  // Load initial page or when filters / page / itemsPerPage change
  const loadPage = useCallback(
    async (requestedPage = 1, append = false, currentFilters = filters) => {
      setLoading(true);
      try {
        const data = await getItems(
          requestedPage,
          itemsPerPage,
          currentFilters,
        );

        // Optionally hide the current user's own listings
        let items = data.items || [];
        if (sessionUserId && currentFilters.hideMyListings) {
          items = items.filter((item) => {
            if (!item || !item.sellerId) return true;
            return String(item.sellerId) !== String(sessionUserId);
          });
        }

        if (append) {
          setFilteredItems((prev) => [...prev, ...items]);
        } else {
          setFilteredItems(items);
        }
        setPage(Number(data.page || requestedPage));
        setHasMore(Boolean(data.hasMore));
        setTotal(Number(data.total || 0));
      } catch (error) {
        console.error('Failed to load items:', error);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage, filters, sessionUserId],
  );

  useEffect(() => {
    // reset to first page whenever filters or itemsPerPage changes
    loadPage(1, false, filters);
  }, [loadPage, filters, itemsPerPage]);

  const handleFiltersChange = (newFilters) => {
    // Merge with existing filters so we don't drop things like availability
    const mergedFilters = {
      ...filters,
      ...newFilters,
    };

    // Ensure availability is always defined; default to 'available'
    if (!mergedFilters.availability) {
      mergedFilters.availability = 'available';
    }

    // Ensure hideMyListings is always defined; default to true
    if (typeof mergedFilters.hideMyListings === 'undefined') {
      mergedFilters.hideMyListings = true;
    }

    const wantsDistance = mergedFilters.sortBy === 'distance';

    if (wantsDistance) {
      // If we already have a cached location, reuse it
      if (userLocation) {
        setLocationError('');
        setFilters({
          ...mergedFilters,
          lat: userLocation.lat,
          lng: userLocation.lng,
        });
        return;
      }

      // If geolocation is not supported, fall back to newest
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setLocationError('Location is not supported on this device.');

        // Fall back to newest and strip any latent lat/lng
        const fallback = {
          ...mergedFilters,
          sortBy: 'newest',
        };
        const cleanFallback = Object.fromEntries(
          Object.entries(fallback).filter(
            ([key]) => key !== 'lat' && key !== 'lng',
          ),
        );
        setFilters(cleanFallback);
        return;
      }

      // Ask for location once
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: Number(pos.coords.latitude.toFixed(3)),
            lng: Number(pos.coords.longitude.toFixed(3)),
          };
          setUserLocation(loc);
          setLocationError('');
          setFilters({
            ...mergedFilters,
            lat: loc.lat,
            lng: loc.lng,
          });
        },
        (err) => {
          console.error('Geolocation error:', err);
          setLocationError(
            'Could not access your location. Showing newest listings instead.',
          );

          const fallback = {
            ...mergedFilters,
            sortBy: 'newest',
          };
          const cleanFallback = Object.fromEntries(
            Object.entries(fallback).filter(
              ([key]) => key !== 'lat' && key !== 'lng',
            ),
          );
          setFilters(cleanFallback);
        },
        { timeout: 8000 },
      );
      return;
    }

    // Non-distance sorts: ensure we strip out any lat/lng from previous distance filters
    const rest = Object.fromEntries(
      Object.entries(mergedFilters).filter(
        ([key]) => key !== 'lat' && key !== 'lng',
      ),
    );
    setLocationError('');
    setFilters(rest);
    // loadPage effect will run due to filters dependency
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      availability: 'available',
      hideMyListings: true,
    };
    setLocationError('');
    setUserLocation(null);
    setFilters(clearedFilters);
    // loadPage effect will reset filtered items
  };

  // numbered pagination handler
  const handlePageChange = async (newPage) => {
    if (!newPage || newPage === page) return;
    // request the new page and replace items (not append)
    await loadPage(newPage, false, filters);
  };

  // calculate active filters count
  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (
        key === 'sortBy' ||
        key === 'lat' ||
        key === 'lng' ||
        key === 'availability' ||
        key === 'hideMyListings'
      )
        return false;
      return Boolean(value && value !== '');
    }).length;
  };

  // get sort label
  const getSortLabel = () => {
    const sortLabels = {
      newest: 'Newest first',
      oldest: 'Oldest first',
      'price-low': 'Price: Low to High',
      'price-high': 'Price: High to Low',
      distance: 'Distance (Closest first)',
    };
    return sortLabels[filters.sortBy] || 'Newest first';
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
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
          {locationError && (
            <p className={styles.locationError}>{locationError}</p>
          )}
        </section>

        {/* Content Section */}
        <ItemGrid
          items={filteredItems}
          loading={loading}
          hasMore={hasMore}
          hideMyListings={filters.hideMyListings ?? true}
          onToggleHideMyListings={(checked) =>
            setFilters((prev) => ({
              ...prev,
              hideMyListings: checked,
            }))
          }
        />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            page={page}
            total={total}
            limit={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
