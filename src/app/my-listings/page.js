'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ItemCard from '@/components/ItemCard/ItemCard';
import styles from './page.module.css';

export default function MyListingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State management
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  // Fetch user's listings
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchMyListings = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `/api/items?sellerId=${session.user.id}&limit=50&sortBy=${sortBy}`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }

        const data = await response.json();
        setListings(data.items || []);
      } catch (err) {
        console.error('Error fetching my listings:', err);
        setError('Failed to load your listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, [session?.user?.id, sortBy]);

  // Apply filters whenever listings or filter criteria change
  useEffect(() => {
    let filtered = [...listings];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query),
      );
    }

    setFilteredListings(filtered);
  }, [listings, statusFilter, searchQuery]);

  // Calculate stats
  const stats = {
    total: listings.length,
    available: listings.filter((item) => item.status === 'available').length,
    sold: listings.filter((item) => item.status === 'sold').length,
    //pending: listings.filter(item => item.status === 'pending').length
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            Loading your listings...
          </div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.authMessage}>
            <h2>Please log in to view your listings</h2>
            <Link href="/login" className={styles.loginButton}>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.breadcrumb}>
            <Link href="/" className={styles.backLink}>
              ← Back to Browse
            </Link>
          </div>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>My Listings</h1>
            <p className={styles.subtitle}>Manage all your posted items</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.total}</div>
            <div className={styles.statLabel}>Total Listings</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.available}</div>
            <div className={styles.statLabel}>Available</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.sold}</div>
            <div className={styles.statLabel}>Sold</div>
          </div>
          {/*
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.pending}</div>
            <div className={styles.statLabel}>Pending</div>
          </div> */}
        </div>

        {/* Controls Bar */}
        <div className={styles.controlsBar}>
          {/* Search */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search your listings..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>

          {/* Status Filter */}
          <div className={styles.statusFilters}>
            {[
              { key: 'all', label: 'All', count: stats.total },
              { key: 'available', label: 'Available', count: stats.available },
              { key: 'sold', label: 'Sold', count: stats.sold },
              //{ key: 'pending', label: 'Pending', count: stats.pending }
            ].map((filter) => (
              <button
                key={filter.key}
                className={`${styles.statusButton} ${statusFilter === filter.key ? styles.active : ''}`}
                onClick={() => handleStatusFilterChange(filter.key)}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          {/* Sort and View Controls */}
          <div className={styles.rightControls}>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className={styles.sortSelect}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                ⊞
              </button>
              <button
                className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                ☰
              </button>
            </div>

            <Link href="/add-listing" className={styles.addButton}>
              ＋ Add Listing
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Results */}
        <div className={styles.resultsInfo}>
          Showing {filteredListings.length} of {stats.total} listings
        </div>

        {/* Listings Content */}
        <div className={styles.content}>
          {filteredListings.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📦</div>
              <h3>
                {statusFilter === 'all'
                  ? "You haven't posted any listings yet"
                  : `No ${statusFilter} listings found`}
              </h3>
              <p>
                {searchQuery
                  ? `No results found for "${searchQuery}"`
                  : statusFilter === 'all'
                    ? 'Start selling your baby items to other parents in your community!'
                    : `You don't have any ${statusFilter} listings at the moment.`}
              </p>
              {statusFilter === 'all' && !searchQuery && (
                <Link href="/add-listing" className={styles.emptyActionButton}>
                  Create Your First Listing
                </Link>
              )}
            </div>
          ) : (
            <div
              className={`${styles.itemsContainer} ${viewMode === 'list' ? styles.listView : styles.gridView}`}
            >
              {filteredListings.map((item) => (
                <div key={item._id} className={styles.itemWrapper}>
                  <ItemCard item={item} />
                  <div className={styles.itemActions}>
                    <span
                      className={`${styles.statusBadge} ${styles[item.status] || styles.available}`}
                    >
                      {item.status === 'available' && '✓ Available'}
                      {item.status === 'sold' && '✗ Sold'}
                      {/*{item.status === 'pending' && '⏳ Pending'} */}
                    </span>
                    <div className={styles.actionButtons}>
                      <Link
                        href={`/Items/${item._id}`}
                        className={styles.viewButton}
                      >
                        View
                      </Link>
                      {/* Future: Edit and status management buttons */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
