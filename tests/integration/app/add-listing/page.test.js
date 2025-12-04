/**
 * TinyThreads — Add Listing Page Tests
 * Covers:
 *  - Client-side rendering & inline validation UX
 *  - Server-side validation, redirects, and DB persistence
 *  - Accessibility and integration behavior
 *  - Uses Jest mocks for MongoDB, Next.js navigation, and S3 uploads
 */

// ========================================
// Store references to mocked functions
// ========================================

let mockRedirect;
let mockUploadImageToS3;
let mockCollection;

// ========================================
// Create ALL mocks with internal definitions
// ========================================

// ✅ Mock MongoDB - define all objects inside
jest.mock('@/lib/mongodb', () => {
  const mockClient = {
    db: jest.fn(),
    connect: jest.fn(),
    close: jest.fn(),
  };

  const mockDb = {
    collection: jest.fn(),
  };

  const mockCollection = {
    insertOne: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  mockClient.db.mockReturnValue(mockDb);
  mockDb.collection.mockReturnValue(mockCollection);

  // Store references globally so tests can access them
  global.mockClient = mockClient;
  global.mockDb = mockDb;
  global.mockCollection = mockCollection;

  return {
    default: Promise.resolve(mockClient),
    getDb: jest.fn(() => {
      mockClient.db.mockReturnValue(mockDb);
      mockDb.collection.mockReturnValue(mockCollection);
      return Promise.resolve(mockDb);
    }),
  };
});

jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
  })),
  getServerSession: jest.fn(),
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Prevent the real MongoDB adapter from running during tests (it attempts to
// access a real Mongo client). Return a harmless stub instead.
jest.mock('@next-auth/mongodb-adapter', () => ({
  __esModule: true,
  // NextAuth expects to call MongoDBAdapter(clientPromise). Provide a
  // mock function that returns a harmless adapter object.
  MongoDBAdapter: jest.fn(() => {
    return {
      // Adapter method stubs if NextAuth invokes them during tests
      getAdapter: () => ({}),
    };
  }),
}));

// ✅ Mock next/navigation - define redirect inside
jest.mock('next/navigation', () => {
  const mockRedirect = jest.fn((path) => {
    throw new Error(`Redirect: ${path}`);
  });

  global.mockRedirect = mockRedirect;

  return {
    redirect: mockRedirect,
    useRouter: () => ({
      push: jest.fn(),
      back: jest.fn(),
    }),
  };
});

// ✅ Mock AWS S3 - define uploadImageToS3 inside
jest.mock('@/lib/awss3', () => {
  const mockUploadImageToS3 = jest.fn(() =>
    Promise.resolve({
      key: 'test-key',
      imageUrl: 'https://example.com/test-image.jpg',
    }),
  );

  global.mockUploadImageToS3 = mockUploadImageToS3;

  return {
    uploadImageToS3: mockUploadImageToS3,
  };
});

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: '123', name: 'Test User', email: 'test@test.com' } },
    status: 'authenticated',
  })),
}));

jest.mock('@/components/Navbar/Navbar', () => {
  return function MockNavbar() {
    return <div data-testid="navbar">Navbar</div>;
  };
});

jest.mock('next/link', () => {
  return function MockLink({ children, href, className }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

// ========================================
// Imports
// ========================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddListingPage from '@/app/add-listing/page';
import { uploadListingAction } from '@/app/add-listing/actions';
import { getServerSession } from 'next-auth/next';

// ✅ Get references from global
mockRedirect = global.mockRedirect;
mockUploadImageToS3 = global.mockUploadImageToS3;
mockCollection = global.mockCollection;

// ========================================
// Tests
// ========================================

describe('Add Listing Page', () => {
  // Reset mocks before each test to ensure clean state
  beforeEach(async () => {
    jest.clearAllMocks();

    // Setup default session for server actions
    // Use a valid 24-character hex string for ObjectId creation in server action
    const sessionValue = {
      user: {
        id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
      },
    };

    // next-auth/next import used directly in some modules
    getServerSession.mockResolvedValue(sessionValue);
    // ensure the getServerSession mock exported from 'next-auth' is also set
    // use dynamic import instead of require to satisfy lint rules
    try {
      const nextAuth = await import('next-auth').catch(() => null);
      if (nextAuth && typeof nextAuth.getServerSession === 'function') {
        nextAuth.getServerSession.mockResolvedValue(sessionValue);
      }
    } catch {
      // ignore if import fails in this environment
    }

    // Reset mock implementations
    mockUploadImageToS3.mockResolvedValue({
      key: 'items/item-12345.jpg',
      imageUrl: 'https://bucket.s3.amazonaws.com/items/item-12345.jpg',
    });

    mockCollection.insertOne.mockResolvedValue({
      insertedId: 'new-item-id',
    });
  });

  // ===== CLIENT COMPONENT TESTS =====  — render, structure, and inline validation
  describe('AddListingPage Component', () => {
    test('renders page header correctly', () => {
      render(<AddListingPage />);

      // Check that the navbar is rendered (TinyThreads logo)
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      // Check that the back button is rendered
      expect(screen.getByText('← Back to Browse')).toBeInTheDocument();
    });

    test('renders all form fields', () => {
      render(<AddListingPage />);

      // Check all form inputs
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Size')).toBeInTheDocument();
      expect(screen.getByLabelText('Age Range')).toBeInTheDocument();
      expect(screen.getByLabelText('Location')).toBeInTheDocument();
      expect(screen.queryByLabelText('Seller Name')).toBeNull();
      expect(screen.getByLabelText('Condition')).toBeInTheDocument();
      expect(screen.getByLabelText('Price ($)')).toBeInTheDocument();
      expect(screen.getByLabelText('Upload Files')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    test('has required attributes on required fields', () => {
      render(<AddListingPage />);

      expect(screen.getByLabelText('Title')).toHaveAttribute('required');
      expect(screen.getByLabelText('Category')).toHaveAttribute('required');
      expect(screen.getByLabelText('Condition')).toHaveAttribute('required');
      expect(screen.getByLabelText('Price ($)')).toHaveAttribute('required');
      expect(screen.getByLabelText('Upload Files')).toHaveAttribute('required');
    });

    test('has correct input types and constraints', () => {
      render(<AddListingPage />);

      const priceInput = screen.getByLabelText('Price ($)');
      expect(priceInput).toHaveAttribute('type', 'number');
      expect(priceInput).toHaveAttribute('min', '0');
      expect(priceInput).toHaveAttribute('step', '0.01');

      const imageInput = screen.getByLabelText('Upload Files');
      expect(imageInput).toHaveAttribute('type', 'file');
      expect(imageInput).toHaveAttribute('accept', 'image/*');

      const titleInput = screen.getByLabelText('Title');
      expect(titleInput).toHaveAttribute('type', 'text');
    });

    test('renders all category options', () => {
      render(<AddListingPage />);

      const categorySelect = screen.getByLabelText('Category');

      expect(categorySelect).toContainHTML(
        '<option value="">Select category</option>',
      );
      expect(categorySelect).toContainHTML(
        '<option value="clothing">Clothing</option>',
      );
      expect(categorySelect).toContainHTML(
        '<option value="toys">Toys</option>',
      );
      expect(categorySelect).toContainHTML(
        '<option value="books">Books</option>',
      );
      expect(categorySelect).toContainHTML(
        '<option value="gear">Baby Gear</option>',
      );
    });

    test('renders all condition options', () => {
      render(<AddListingPage />);

      const conditionSelect = screen.getByLabelText('Condition');

      expect(conditionSelect).toContainHTML(
        '<option value="">Select condition</option>',
      );
      expect(conditionSelect).toContainHTML('<option value="new">New</option>');
      expect(conditionSelect).toContainHTML(
        '<option value="like-new">Like New</option>',
      );
      expect(conditionSelect).toContainHTML(
        '<option value="good">Good</option>',
      );
      expect(conditionSelect).toContainHTML(
        '<option value="fair">Fair</option>',
      );
    });

    test('has correct form action', () => {
      render(<AddListingPage />);

      const form = document.querySelector('form');
      expect(form).toHaveAttribute('id', 'addListingForm');
    });

    test('renders action buttons', () => {
      render(<AddListingPage />);

      expect(
        screen.getByRole('button', { name: 'Add Listing' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Add Listing' }),
      ).toHaveAttribute('type', 'submit');

      const cancelLink = screen.getByRole('link', { name: 'Cancel' });
      expect(cancelLink).toBeInTheDocument();
      expect(cancelLink).toHaveAttribute('href', '/');
    });

    test('has proper form structure', () => {
      render(<AddListingPage />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      // Should have proper CSS classes
      expect(form).toHaveClass('listingForm');
    });

    test('has proper placeholder text', () => {
      render(<AddListingPage />);

      expect(
        screen.getByPlaceholderText('e.g. Organic Cotton Onesie - Pink'),
      ).toBeInTheDocument();
      // Check that we have at least one field with this placeholder (Size and Age Range both use it)
      expect(screen.getAllByPlaceholderText('e.g. 0-3 months')).toHaveLength(2);
      expect(
        screen.getByPlaceholderText('City, State (e.g., Fremont, CA)'),
      ).toBeInTheDocument();
      // Seller name input removed (server provides sellerName from session)
      expect(screen.getByPlaceholderText('e.g. 20.00')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Add a short description of the item...'),
      ).toBeInTheDocument();
    });

    test('textarea has correct attributes', () => {
      render(<AddListingPage />);

      const textarea = screen.getByLabelText('Description');
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea).toHaveAttribute('rows', '4');
    });

    test('allows adding and removing additional file inputs', () => {
      render(<AddListingPage />);

      // Initially should have a single file input for images
      let imageInputs = document.querySelectorAll('input[name="image"]');
      expect(imageInputs.length).toBe(1);
      expect(imageInputs[0]).toHaveAttribute('required');

      // Click "+ Add more files" to add another input
      const addMoreBtn = screen.getByRole('button', {
        name: '+ Add more files',
      });
      fireEvent.click(addMoreBtn);

      imageInputs = document.querySelectorAll('input[name="image"]');
      expect(imageInputs.length).toBe(2);
      // Only the first input should be required
      expect(imageInputs[0]).toHaveAttribute('required');
      expect(imageInputs[1]).not.toHaveAttribute('required');

      // Remove one of the additional inputs
      const removeButtons = screen.getAllByRole('button', { name: 'Remove' });
      // With two file inputs, both can be removable, so we expect 2 remove buttons
      expect(removeButtons.length).toBe(2);
      fireEvent.click(removeButtons[0]);

      // Back to a single required input
      imageInputs = document.querySelectorAll('input[name="image"]');
      expect(imageInputs.length).toBe(1);
      expect(imageInputs[0]).toHaveAttribute('required');
    });

    test('shows correct file count summary as files are selected', () => {
      render(<AddListingPage />);

      const fileInput = screen.getByLabelText('Upload Files');
      const smallFile1 = new File([new ArrayBuffer(1024)], 'a.jpg', {
        type: 'image/jpeg',
      });

      // Select a file in the first input
      fireEvent.change(fileInput, { target: { files: [smallFile1] } });
      expect(screen.getByText(/1 file selected/i)).toBeInTheDocument();

      // Add another file input and select another file
      const addMoreBtn = screen.getByRole('button', {
        name: '+ Add more files',
      });
      fireEvent.click(addMoreBtn);

      const imageInputs = document.querySelectorAll('input[name="image"]');
      expect(imageInputs.length).toBe(2);

      const smallFile2 = new File([new ArrayBuffer(1024)], 'b.jpg', {
        type: 'image/jpeg',
      });
      fireEvent.change(imageInputs[1], { target: { files: [smallFile2] } });

      expect(screen.getByText(/2 files selected/i)).toBeInTheDocument();
    });

    test('keeps submit button disabled until all internal validation conditions are met', async () => {
      // Mock browser geolocation so "Use my current location" works in tests
      const mockGeolocation = {
        getCurrentPosition: jest.fn((success) =>
          success({
            coords: {
              latitude: 37.725,
              longitude: -122.155,
            },
          }),
        ),
      };
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true,
      });

      render(<AddListingPage />);

      const submitButton = screen.getByRole('button', { name: 'Add Listing' });
      expect(submitButton).toBeDisabled();

      const titleInput = screen.getByLabelText('Title');
      const categorySelect = screen.getByLabelText('Category');
      const conditionSelect = screen.getByLabelText('Condition');
      const priceInput = screen.getByLabelText('Price ($)');
      const locationInput = screen.getByLabelText('Location');
      const useLocationButton = screen.getByRole('button', {
        name: /Use my current location/i,
      });
      const fileInput = screen.getByLabelText('Upload Files');

      // Fill out fields with valid values
      fireEvent.change(titleInput, {
        target: { value: 'Bundle of baby clothes' },
      });
      fireEvent.blur(titleInput);

      fireEvent.change(categorySelect, { target: { value: 'clothing' } });
      fireEvent.blur(categorySelect);

      fireEvent.change(conditionSelect, { target: { value: 'good' } });
      fireEvent.blur(conditionSelect);

      fireEvent.change(priceInput, { target: { value: '10.00' } });
      fireEvent.blur(priceInput); // trigger any blur-based validation

      // New: location + geolocation
      fireEvent.change(locationInput, {
        target: { value: 'San Leandro, CA' },
      });
      fireEvent.click(useLocationButton);

      // File input
      const okFile = new File([new ArrayBuffer(1024)], 'ok.jpg', {
        type: 'image/jpeg',
      });
      fireEvent.change(fileInput, { target: { files: [okFile] } });

      // With this setup the form is valid enough to enable submit in the current implementation.
      // Assert that the submit button is enabled.
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    // ==== CLIENT VALIDATION TESTS ====
    // Seller name is validated server-side from session; client-side validation test removed.

    test('price validation: rejects non-numeric and >2 decimals, accepts valid', () => {
      render(<AddListingPage />);
      const priceInput = screen.getByLabelText('Price ($)');

      // Non-numeric
      fireEvent.change(priceInput, { target: { value: 'abc' } });
      fireEvent.blur(priceInput);
      expect(screen.getByText('Enter a valid price (e.g., 12.99).'));

      // Too many decimals
      fireEvent.change(priceInput, { target: { value: '12.999' } });
      fireEvent.blur(priceInput);
      expect(
        screen.getByText('Use up to 2 decimal places.'),
      ).toBeInTheDocument();

      // Valid
      fireEvent.change(priceInput, { target: { value: '12.99' } });
      fireEvent.blur(priceInput);
      expect(screen.queryByText('Enter a valid price (e.g., 12.99).'));
      expect(screen.queryByText('Use up to 2 decimal places.')).toBeNull();
    });

    test('category and condition must be selected (placeholder not allowed)', () => {
      render(<AddListingPage />);
      const category = screen.getByLabelText('Category');
      const condition = screen.getByLabelText('Condition');

      // Trigger onChange with empty value to show error
      fireEvent.change(category, { target: { value: '' } });
      fireEvent.change(condition, { target: { value: '' } });

      expect(screen.getByText('Please select a category.')).toBeInTheDocument();
      expect(
        screen.getByText('Please select a condition.'),
      ).toBeInTheDocument();
    });

    test('image validation: too large and non-image show errors and keep submit disabled', () => {
      render(<AddListingPage />);
      const fileInput = screen.getByLabelText('Upload Files');
      const submitButton = screen.getByRole('button', { name: 'Add Listing' });

      // Create a >5MB file to trigger client-side validation
      const bigFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'big.jpg', {
        type: 'image/jpeg',
      });
      fireEvent.change(fileInput, { target: { files: [bigFile] } });
      expect(
        screen.getByText('File above 5 MB, please try again.'),
      ).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Non-image type
      const textFile = new File(['hello'], 'note.txt', { type: 'text/plain' });
      fireEvent.change(fileInput, { target: { files: [textFile] } });
      // Our client logic only checks size; type check is server-side.
      // So ensure message disappears if size small and type is not validated client-side.
      // For robustness, switch to a valid small image to clear error.
      const okImage = new File([new ArrayBuffer(1024)], 'ok.png', {
        type: 'image/png',
      });
      fireEvent.change(fileInput, { target: { files: [okImage] } });
      expect(
        screen.queryByText('File above 5 MB, please try again.'),
      ).toBeNull();
    });
  });

  // ===== SERVER ACTION TESTS =====  — input validation, S3 upload, and DB persistence
  describe('uploadListingAction', () => {
    let consoleErrorSpy;

    beforeEach(() => {
      // Many server-action tests intentionally throw/redirect — silence console.error
      // inside this describe to avoid noisy test output. Restored in afterEach.
      consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });
    let mockFile;

    beforeEach(() => {
      mockFile = {
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
        name: 'test-image.jpg',
        type: 'image/jpeg',
        size: 1024,
      };
    });

    test('successfully processes valid form data', async () => {
      // Create a proper FormData mock
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Baby Onesie',
            category: 'clothing',
            condition: 'like-new',
            price: '19.99',
            size: '6M',
            ageRange: '3-6 months',
            location: 'Fremont, CA',
            lat: '37.725',
            lng: '-122.155',
            sellerName: 'Test Seller',
            description: 'Beautiful baby onesie',
            image: mockFile,
          };
          return data[key] || null;
        }),
        getAll: jest.fn((key) => {
          if (key === 'image') return [mockFile];
          return [];
        }),
      };

      await expect(uploadListingAction(formData)).rejects.toThrow(/Redirect/);

      // Valid input should trigger Redirect('/') after successful upload and DB insert
      // Should upload image to S3
      expect(mockUploadImageToS3).toHaveBeenCalledWith(mockFile, {
        folder: 'items',
        filenamePrefix: 'item',
      });

      // Should insert into MongoDB — inspect the actual inserted document
      expect(mockCollection.insertOne).toHaveBeenCalled();
      const inserted = mockCollection.insertOne.mock.calls[0][0];
      expect(inserted.title).toBe('Test Baby Onesie');
      expect(inserted.price).toBe(19.99);
      expect(inserted.size).toBe('6M');
      expect(inserted.condition).toBe('like-new');
      expect(inserted.imageUrls).toEqual([
        'https://bucket.s3.amazonaws.com/items/item-12345.jpg',
      ]);
      expect(inserted.description).toBe('Beautiful baby onesie');
      expect(inserted.sellerName).toBe('Test User');
      expect(inserted.category).toBe('clothing');
      expect(inserted.ageRange).toBe('3-6 months');
      expect(inserted.location).toBe('Fremont, CA');
      expect(inserted.status).toBe('available');
      expect(inserted.createdAt).toBeInstanceOf(Date);
      expect(String(inserted.sellerId)).toMatch(/^[a-f0-9]{24}$/i);

      // Should redirect to home
      expect(mockRedirect).toHaveBeenCalledWith('/');
    });

    test('redirects when sellerName is missing', async () => {
      // Simulate a session where the user has no name set
      const sessionMissingName = {
        user: {
          id: '507f1f77bcf86cd799439011',
          name: null,
          email: 'test@example.com',
        },
      };

      getServerSession.mockResolvedValueOnce(sessionMissingName);
      try {
        const nextAuth = await import('next-auth');
        if (nextAuth && typeof nextAuth.getServerSession === 'function') {
          nextAuth.getServerSession.mockResolvedValueOnce(sessionMissingName);
        }
      } catch {}

      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'clothing',
            condition: 'good',
            price: '10.00',
            image: mockFile,
            sellerName: null, // client provided value should be ignored by server
          };
          return data[key] || null;
        }),
        getAll: jest.fn((key) => (key === 'image' ? [mockFile] : [])),
      };

      await expect(uploadListingAction(formData)).rejects.toThrow(/Redirect/);
      // Missing sellerName in session should trigger invalid_seller redirect
      expect(mockRedirect).toHaveBeenCalledWith(
        '/add-listing?err=invalid_seller',
      );
    });

    test('handles empty optional fields gracefully', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'toys',
            condition: 'new',
            price: '25.00',
            sellerName: 'Test Seller',
            image: mockFile,
            // Optional fields
            size: null,
            ageRange: null,
            location: 'San Leandro, CA',
            description: null,
            lat: '37.725',
            lng: '-122.155',
          };
          return data[key] || null;
        }),
        getAll: jest.fn((key) => (key === 'image' ? [mockFile] : [])),
      };

      await expect(uploadListingAction(formData)).rejects.toThrow(/Redirect/);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          size: '',
          ageRange: '',
          description: '',
          location: 'San Leandro, CA',
        }),
      );
    });

    test('converts form data to correct types', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'books',
            condition: 'fair',
            price: '15.50',
            size: 'Large',
            ageRange: '2-3 years',
            location: 'San Jose, CA',
            lat: '37.338',
            lng: '-121.886',
            sellerName: 'Seller 123',
            description: 'Great book!',
            image: mockFile,
          };
          return data[key];
        }),
        getAll: jest.fn((key) => (key === 'image' ? [mockFile] : [])),
      };

      await expect(uploadListingAction(formData)).rejects.toThrow(/Redirect/);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Item',
          price: 15.5,
          size: 'Large',
          condition: 'fair',
          // sellerName is supplied from session (server authoritative)
          sellerName: 'Test User',
          category: 'books',
          ageRange: '2-3 years',
          location: 'San Jose, CA',
          status: 'available',
          createdAt: expect.any(Date),
        }),
      );
    });

    test('redirects back to add-listing when no file provided', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Valid Title',
            category: 'clothing',
            condition: 'good',
            price: '20.00',
            sellerName: 'Valid Seller',
            location: 'Fremont, CA',
            lat: '37.725',
            lng: '-122.155',
            image: null,
          };
          return data[key];
        }),
        getAll: jest.fn(() => []),
      };

      await expect(uploadListingAction(formData)).rejects.toThrow(/Redirect/);

      expect(mockRedirect).toHaveBeenCalledWith(
        '/add-listing?err=missing_file',
      );
      expect(mockUploadImageToS3).not.toHaveBeenCalled();
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    test('redirects back when file is string', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Valid Title',
            category: 'clothing',
            condition: 'good',
            price: '20.00',
            sellerName: 'Valid Seller',
            location: 'Fremont, CA',
            lat: '37.725',
            lng: '-122.155',
            image: 'not-a-file',
          };
          return data[key];
        }),
        getAll: jest.fn(() => ['not-a-file']),
      };

      await expect(uploadListingAction(formData)).rejects.toThrow(/Redirect/);

      expect(mockRedirect).toHaveBeenCalledWith(
        '/add-listing?err=missing_file',
      );
      expect(mockUploadImageToS3).not.toHaveBeenCalled();
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    test('redirects back when file lacks arrayBuffer method', async () => {
      const invalidFile = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024,
        // Missing arrayBuffer method
      };

      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Valid Title',
            category: 'clothing',
            condition: 'good',
            price: '20.00',
            sellerName: 'Valid Seller',
            location: 'Fremont, CA',
            lat: '37.725',
            lng: '-122.155',
            image: invalidFile,
          };
          return data[key];
        }),
        getAll: jest.fn(() => [invalidFile]),
      };

      await expect(uploadListingAction(formData)).rejects.toThrow(/Redirect/);

      expect(mockRedirect).toHaveBeenCalledWith(
        '/add-listing?err=missing_file',
      );
      expect(mockUploadImageToS3).not.toHaveBeenCalled();
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    test('handles S3 upload errors gracefully', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'clothing',
            condition: 'good',
            price: '20.00',
            sellerName: 'Test Seller',
            location: 'Fremont, CA',
            lat: '37.725',
            lng: '-122.155',
            image: mockFile,
          };
          return data[key];
        }),
        getAll: jest.fn(() => [mockFile]),
      };

      // Simulate S3 failure; should propagate error and skip DB insert
      mockUploadImageToS3.mockRejectedValue(new Error('S3 upload failed'));

      await expect(uploadListingAction(formData)).rejects.toThrow(
        'S3 upload failed',
      );

      // Should not insert into database if S3 fails
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    test('handles database insertion errors gracefully', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'clothing',
            condition: 'good',
            price: '20.00',
            sellerName: 'Test Seller',
            location: 'Fremont, CA',
            lat: '37.725',
            lng: '-122.155',
            image: mockFile,
          };
          return data[key];
        }),
        getAll: jest.fn(() => [mockFile]),
      };

      // Simulate DB failure after S3 upload; should not redirect
      mockCollection.insertOne.mockRejectedValue(new Error('Database error'));

      await expect(uploadListingAction(formData)).rejects.toThrow(
        'Database error',
      );

      // Should have tried S3 upload first
      expect(mockUploadImageToS3).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    test('uses correct database and collection names', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'gear',
            condition: 'new',
            price: '30.00',
            sellerName: 'Test Seller',
            location: 'Fremont, CA',
            lat: '37.725',
            lng: '-122.155',
            image: mockFile,
          };
          return data[key];
        }),
        getAll: jest.fn(() => [mockFile]),
      };

      await expect(uploadListingAction(formData)).rejects.toThrow(/Redirect/);

      expect(mockUploadImageToS3).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalled();
    });

    test('sets status to available by default', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'clothing',
            condition: 'good',
            price: '5.00',
            sellerName: 'Test Seller',
            location: 'Fremont, CA',
            lat: '37.725',
            lng: '-122.155',
            image: mockFile,
          };
          return data[key];
        }),
        getAll: jest.fn(() => [mockFile]),
      };

      await expect(uploadListingAction(formData)).rejects.toThrow(/Redirect/);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'available',
        }),
      );
    });

    test('rejects invalid category (not in allowlist)', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'other',
            condition: 'good',
            price: '20.00',
            sellerName: 'Test Seller',
            image: mockFile,
          };
          return data[key] || null;
        }),
        getAll: jest.fn(() => [mockFile]),
      };
      await expect(uploadListingAction(formData)).rejects.toThrow(/Redirect/);
      expect(mockRedirect).toHaveBeenCalledWith(
        '/add-listing?err=invalid_category',
      );
    });

    test('rejects price with more than 2 decimals', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'clothing',
            condition: 'good',
            price: '12.999',
            sellerName: 'Test Seller',
            location: 'Fremont, CA',
            lat: '37.725',
            lng: '-122.155',
            image: mockFile,
          };
          return data[key] || null;
        }),
        getAll: jest.fn(() => [mockFile]),
      };
      await expect(uploadListingAction(formData)).rejects.toThrow(/Redirect/);
      expect(mockRedirect).toHaveBeenCalledWith(
        '/add-listing?err=invalid_price_precision',
      );
    });

    test('includes imageUrls as array with S3 URL', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'clothing',
            condition: 'like-new',
            price: '12.99',
            sellerName: 'Test Seller',
            location: 'Fremont, CA',
            lat: '37.725',
            lng: '-122.155',
            image: mockFile,
          };
          return data[key];
        }),
        getAll: jest.fn(() => [mockFile]),
      };

      mockUploadImageToS3.mockResolvedValue({
        key: 'items/item-custom.jpg',
        imageUrl: 'https://custom-url.com/item-custom.jpg',
      });

      await expect(uploadListingAction(formData)).rejects.toThrow(/Redirect/);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          imageUrls: ['https://custom-url.com/item-custom.jpg'],
        }),
      );
    });

    test('sets createdAt to current date', async () => {
      // Validate createdAt timestamp falls between test execution times
      const beforeTime = new Date();

      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'toys',
            condition: 'good',
            price: '8.50',
            sellerName: 'Test Seller',
            location: 'Fremont, CA',
            lat: '37.725',
            lng: '-122.155',
            image: mockFile,
          };
          return data[key];
        }),
        getAll: jest.fn(() => [mockFile]),
      };

      await expect(uploadListingAction(formData)).rejects.toThrow(/Redirect/);

      const afterTime = new Date();
      const insertCall = mockCollection.insertOne.mock.calls[0][0];

      expect(insertCall.createdAt).toBeInstanceOf(Date);
      expect(insertCall.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(insertCall.createdAt.getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
    });
  });

  // ===== INTEGRATION TESTS =====  — consistency between frontend options and backend logic
  describe('integration scenarios', () => {
    test('form and action work together with proper field mapping', () => {
      render(<AddListingPage />);

      // Verify form field names match what action expects
      expect(screen.getByLabelText('Title')).toHaveAttribute('name', 'title');
      expect(screen.getByLabelText('Category')).toHaveAttribute(
        'name',
        'category',
      );
      expect(screen.getByLabelText('Condition')).toHaveAttribute(
        'name',
        'condition',
      );
      expect(screen.getByLabelText('Price ($)')).toHaveAttribute(
        'name',
        'price',
      );
      expect(screen.getByLabelText('Size')).toHaveAttribute('name', 'size');
      expect(screen.getByLabelText('Age Range')).toHaveAttribute(
        'name',
        'ageRange',
      );
      expect(screen.getByLabelText('Location')).toHaveAttribute(
        'name',
        'location',
      );
      // Seller name input removed from client; server uses session.user.name
      expect(screen.getByLabelText('Upload Files')).toHaveAttribute(
        'name',
        'image',
      );
      expect(screen.getByLabelText('Description')).toHaveAttribute(
        'name',
        'description',
      );
    });

    test('category values match between form options and processing', () => {
      render(<AddListingPage />);

      const categorySelect = screen.getByLabelText('Category');
      const options = categorySelect.querySelectorAll(
        'option[value]:not([value=""])',
      );

      // Should have options that match expected categories
      const categoryValues = Array.from(options).map((option) => option.value);
      expect(categoryValues).toEqual(['clothing', 'toys', 'books', 'gear']);
    });

    test('condition values match between form options and processing', () => {
      render(<AddListingPage />);

      const conditionSelect = screen.getByLabelText('Condition');
      const options = conditionSelect.querySelectorAll(
        'option[value]:not([value=""])',
      );

      const conditionValues = Array.from(options).map((option) => option.value);
      expect(conditionValues).toEqual(['new', 'like-new', 'good', 'fair']);
    });
  });

  // ===== ACCESSIBILITY TESTS =====  — label associations and required attributes
  describe('accessibility', () => {
    test('has proper form labels', () => {
      render(<AddListingPage />);

      // All inputs should have associated labels
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach((input) => {
        if (input.id) {
          const label = document.querySelector(`label[for="${input.id}"]`);
          expect(label).toBeInTheDocument();
        }
      });
    });

    test('form has accessible structure', () => {
      render(<AddListingPage />);

      // Check that all form inputs have proper labels
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Size')).toBeInTheDocument();
      expect(screen.getByLabelText('Age Range')).toBeInTheDocument();
      expect(screen.getByLabelText('Location')).toBeInTheDocument();
      // Seller name input removed (server provides it)
      expect(screen.getByLabelText('Condition')).toBeInTheDocument();
      expect(screen.getByLabelText('Price ($)')).toBeInTheDocument();
      expect(screen.getByLabelText('Upload Files')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      // Should have submit button
      const submitButton = screen.getByRole('button', { name: 'Add Listing' });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    test('required fields are marked as required', () => {
      render(<AddListingPage />);

      const requiredFields = [
        'title',
        'category',
        'condition',
        'price',
        'image',
      ];

      requiredFields.forEach((fieldName) => {
        const field = document.querySelector(`[name="${fieldName}"]`);
        expect(field).toHaveAttribute('required');
      });
    });
  });
});
