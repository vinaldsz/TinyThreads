'use client';

import { useState, useEffect } from 'react';

// Hook to compute items-per-page based on viewport width.
// Returns a number suitable to pass as `limit` for paginated requests
// or to compute slices on the client.
export default function useItemsPerPage({ rowsPerPage = 3 } = {}) {
  // rowsPerPage default = 3 since requirement is 3 rows max
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    // default guess for SSR hydration safety
    return 9; // 3 columns x 3 rows
  });

  useEffect(() => {
    function compute() {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
      let columns;

      // Enforce 3 columns on most screens, single column on very small screens
      if (w < 480) columns = 1;
      else columns = 3;

      // items per page = columns * rowsPerPage, cap to at least 1
      const ip = Math.max(1, columns * Math.max(1, rowsPerPage));
      setItemsPerPage(ip);
    }

    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [rowsPerPage]);

  return itemsPerPage;
}
