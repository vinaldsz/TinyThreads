// --- SIMPLE COVERAGE BOOST TESTS FOR EDIT LISTING ---

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EditListingForm from '@/app/edit-listing/[id]/EditListingForm';
import EditListingPage from '@/app/edit-listing/[id]/page';
import { updateListingAction } from '@/app/edit-listing/[id]/actions';
import { getItemById } from '@/services/itemService';

// Mock actions + router
jest.mock('@/app/edit-listing/[id]/actions', () => ({
  updateListingAction: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/services/itemService', () => ({
  getItemById: jest.fn(),
}));

describe('EditListingForm basic behaviour', () => {
  const mockItem = {
    _id: 'item-1',
    title: 'Test Listing',
    price: 25,
    size: 'Medium',
    condition: 'Like New',
    description: 'Some description',
    category: 'clothing',
    ageRange: '2-3 years',
    location: 'San Francisco',
    imageUrls: ['https://example.com/test.jpg'],
    sellerId: 'seller1',
    status: 'available',
  };

  it('submits form and calls updateListingAction', async () => {
    updateListingAction.mockResolvedValue({ success: true });

    render(<EditListingForm item={mockItem} />);

    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateListingAction).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error message when updateListingAction returns error', async () => {
    updateListingAction.mockResolvedValue({ error: 'Something went wrong' });

    render(<EditListingForm item={mockItem} />);

    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});

describe('EditListingPage server component', () => {
  const mockItem = {
    _id: 'item-1',
    title: 'Test Listing',
    price: 25,
    size: 'Medium',
    condition: 'Like New',
    description: 'Some description',
    category: 'clothing',
    ageRange: '2-3 years',
    location: 'San Francisco',
    imageUrls: ['https://example.com/test.jpg'],
    sellerId: 'seller1',
    status: 'available',
  };

  it('renders edit heading when item exists', async () => {
    getItemById.mockResolvedValue(mockItem);

    const jsx = await EditListingPage({
      params: Promise.resolve({ id: 'item-1' }),
    });

    render(jsx);

    expect(screen.getByText(/edit listing/i)).toBeInTheDocument();
  });

  it('renders not found message when item is missing', async () => {
    getItemById.mockResolvedValue(null);

    const jsx = await EditListingPage({
      params: Promise.resolve({ id: 'missing-id' }),
    });

    render(jsx);

    expect(screen.getByText(/listing not found/i)).toBeInTheDocument();
  });
});
