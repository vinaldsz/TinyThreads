import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Ensure next-auth session is mocked for components that read session
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
}));

import BrowsePage from '@/app/page';
import * as itemService from '@/services/itemService';

jest.mock('@/services/itemService');

describe('BrowsePage pagination integration', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // resetAllMocks clears mock implementations including next-auth's useSession
    // restore a working useSession implementation for components that expect it
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const na = require('next-auth/react');
    if (na && na.useSession && na.useSession.mockImplementation) {
      na.useSession.mockImplementation(() => ({
        data: null,
        status: 'unauthenticated',
      }));
    }
  });

  test('loads first page and navigates to page 2 on pagination click', async () => {
    // mock getItems to return different pages
    itemService.getItems.mockImplementation((page, limit) => {
      const total = 18;
      const per = limit;
      const start = (page - 1) * per + 1;
      const items = Array.from(
        { length: Math.min(per, total - (page - 1) * per) },
        (_, i) => ({
          _id: `id-${start + i}`,
          title: `Item ${start + i}`,
          price: 1,
          imageUrls: [],
        }),
      );
      return Promise.resolve({
        items,
        total,
        page,
        limit: per,
        hasMore: page * per < total,
      });
    });

    render(<BrowsePage />);

    // Wait for first page to render items
    await waitFor(() => expect(itemService.getItems).toHaveBeenCalled());

    // Should render item from page 1
    expect(await screen.findByText(/Item 1/i)).toBeInTheDocument();

    // Click page 2 in pagination
    const page2 = await screen.findByRole('button', { name: '2' });
    fireEvent.click(page2);

    // Wait for second page load
    await waitFor(() =>
      expect(itemService.getItems).toHaveBeenCalledWith(
        2,
        expect.any(Number),
        expect.any(Object),
      ),
    );

    // New item from page 2 should be rendered
    expect(await screen.findByText(/Item 10/i)).toBeInTheDocument();
  });
});
