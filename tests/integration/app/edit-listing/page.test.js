// --- Integration tests for Edit Listing ---
const mockPush = jest.fn();

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EditListingForm from '@/app/edit-listing/[id]/EditListingForm';
import EditListingPage from '@/app/edit-listing/[id]/page';
import { updateListingAction } from '@/app/edit-listing/[id]/actions';
import { getItemById } from '@/services/itemService';
import { getServerSession } from 'next-auth';

// Mocks
jest.mock('@/app/edit-listing/[id]/actions', () => ({
  updateListingAction: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/services/itemService', () => ({
  getItemById: jest.fn(),
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

describe('EditListingForm basic behaviour', () => {
  const mockItem = {
    _id: 'item-1',
    title: 'Test Listing',
    price: 25,
    size: 'NB',
    condition: 'like-new',
    description: 'Some description',
    category: 'clothing',
    ageRange: '0-6M',
    location: 'San Francisco',
    imageUrls: ['https://example.com/test.jpg'],
    sellerId: 'seller1',
    status: 'available',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('prevents submit when all images are removed and no new ones are added', async () => {
    updateListingAction.mockResolvedValue({ success: true });

    render(<EditListingForm item={mockItem} />);

    // Remove the only existing image
    const removeBtn = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeBtn);

    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/please keep at least one image or upload a new one/i),
      ).toBeInTheDocument();
    });

    expect(updateListingAction).not.toHaveBeenCalled();
  });

  it('shows location detected message when location is set via button', async () => {
    // Mock geolocation
    const mockGetCurrentPosition = jest.fn((success) =>
      success({
        coords: { latitude: 37.729, longitude: -122.156 },
      }),
    );

    // @ts-expect-error geolocation mocked intentionally for test
    global.navigator.geolocation = {
      getCurrentPosition: mockGetCurrentPosition,
    };

    render(<EditListingForm item={mockItem} />);

    const locBtn = screen.getByRole('button', {
      name: /use my current location/i,
    });
    fireEvent.click(locBtn);

    await waitFor(() => {
      expect(mockGetCurrentPosition).toHaveBeenCalled();
      expect(
        screen.getByText(/location detected successfully\./i),
      ).toBeInTheDocument();
    });
  });

  it('disables price and sets it to 0 when donation is checked', () => {
    render(<EditListingForm item={mockItem} />);

    const priceInput = screen.getByRole('spinbutton', { name: /price/i });
    const donationCheckbox = screen.getByRole('checkbox', {
      name: /donate this item/i,
    });

    // Initially enabled and non-zero
    expect(priceInput).not.toBeDisabled();
    expect(priceInput).toHaveValue(25);

    // Check donation
    fireEvent.click(donationCheckbox);

    expect(priceInput).toBeDisabled();
    expect(priceInput).toHaveValue(0);

    // Uncheck donation
    fireEvent.click(donationCheckbox);

    expect(priceInput).not.toBeDisabled();
  });

  it('requires location button when user changes location text without coords', async () => {
    updateListingAction.mockResolvedValue({ success: true });

    render(<EditListingForm item={mockItem} />);

    const locationInput = screen.getByRole('textbox', { name: /location/i });
    fireEvent.change(locationInput, {
      target: { value: 'Oakland, CA' },
    });

    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/since you updated your location/i),
      ).toBeInTheDocument();
    });

    expect(updateListingAction).not.toHaveBeenCalled();
  });

  it('navigates back to item detail when Cancel is clicked', () => {
    render(<EditListingForm item={mockItem} />);

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(mockPush).toHaveBeenCalledWith('/Items/item-1');
  });

  it('shows validation error when price has more than 2 decimal places', async () => {
    updateListingAction.mockResolvedValue({ success: true });

    render(<EditListingForm item={mockItem} />);

    const priceInput = screen.getByRole('spinbutton', { name: /price/i });
    fireEvent.change(priceInput, { target: { value: '10.123' } });

    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateListingAction).not.toHaveBeenCalled();
    });
  });

  it('requires category when not selected', async () => {
    updateListingAction.mockResolvedValue({ success: true });

    render(<EditListingForm item={mockItem} />);

    const categorySelect = screen.getByLabelText(/category/i);
    fireEvent.change(categorySelect, { target: { value: '' } });

    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateListingAction).not.toHaveBeenCalled();
    });
  });

  it('requires condition when not selected', async () => {
    updateListingAction.mockResolvedValue({ success: true });

    render(<EditListingForm item={mockItem} />);

    const conditionSelect = screen.getByLabelText(/condition/i);
    fireEvent.change(conditionSelect, { target: { value: '' } });

    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateListingAction).not.toHaveBeenCalled();
    });
  });

  it('submits successfully after detecting location coordinates', async () => {
    const mockGetCurrentPosition = jest.fn((success) =>
      success({
        coords: { latitude: 37.729, longitude: -122.156 },
      }),
    );

    // @ts-expect-error geolocation mocked intentionally for test
    global.navigator.geolocation = {
      getCurrentPosition: mockGetCurrentPosition,
    };

    updateListingAction.mockResolvedValue({ success: true });

    render(<EditListingForm item={mockItem} />);

    const locBtn = screen.getByRole('button', {
      name: /use my current location/i,
    });
    fireEvent.click(locBtn);

    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateListingAction).toHaveBeenCalledTimes(1);
    });
  });

  it('shows a generic error message when updateListingAction throws', async () => {
    updateListingAction.mockRejectedValue(new Error('Network error'));

    render(<EditListingForm item={mockItem} />);

    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/something went wrong while saving/i),
      ).toBeInTheDocument();
    });
  });

  it('allows adding an extra file input and displaying selected filename', () => {
    const { container } = render(<EditListingForm item={mockItem} />);

    const addMoreBtn = screen.getByRole('button', {
      name: /add more photos/i,
    });
    fireEvent.click(addMoreBtn);

    const fileInputs = container.querySelectorAll('input[type="file"]');
    expect(fileInputs.length).toBeGreaterThan(1);

    const secondInput = fileInputs[1];
    const file = new File(['dummy'], 'test-image.jpg', {
      type: 'image/jpeg',
    });

    fireEvent.change(secondInput, {
      target: { files: [file] },
    });

    expect(screen.getByText(/test-image.jpg/i)).toBeInTheDocument();
  });
});

describe('EditListingPage server component', () => {
  const mockItem = {
    _id: 'item-1',
    title: 'Test Listing',
    price: 25,
    size: 'NB',
    condition: 'like-new',
    description: 'Some description',
    category: 'clothing',
    ageRange: '0-6M',
    location: 'San Francisco',
    imageUrls: ['https://example.com/test.jpg'],
    sellerId: 'seller1',
    status: 'available',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders edit heading when item exists and user is owner', async () => {
    getItemById.mockResolvedValue(mockItem);
    getServerSession.mockResolvedValue({
      user: { id: 'seller1', name: 'Owner User' },
    });

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

  it('renders not authorized message when user does not own listing', async () => {
    getItemById.mockResolvedValue(mockItem);
    getServerSession.mockResolvedValue({
      user: { id: 'other-user', name: 'Not Owner' },
    });

    const jsx = await EditListingPage({
      params: Promise.resolve({ id: 'item-1' }),
    });

    render(jsx);

    expect(
      screen.getByText(/not authorized to edit this listing/i),
    ).toBeInTheDocument();
  });
});
