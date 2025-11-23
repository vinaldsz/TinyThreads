/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ItemDetailPage from '@/app/Items/[id]/page';

// Mock ItemDetail component
jest.mock('@/components/ItemDetail/ItemDetail', () => {
  return function MockItemDetail({ itemId }) {
    return (
      <div data-testid="item-detail">
        <h1>Item Detail</h1>
        <p>Item ID: {itemId}</p>
      </div>
    );
  };
});

describe('ItemDetailPage', () => {
  it('should render ItemDetail component with correct itemId', async () => {
    const mockParams = {
      params: Promise.resolve({ id: 'test-item-123' }),
    };

    const page = await ItemDetailPage(mockParams);
    const { container } = render(page);

    expect(container.querySelector('[data-testid="item-detail"]')).toBeInTheDocument();
    expect(screen.getByText('Item ID: test-item-123')).toBeInTheDocument();
  });

  it('should handle params as a Promise', async () => {
    const mockParams = {
      params: Promise.resolve({ id: 'async-item-456' }),
    };

    const page = await ItemDetailPage(mockParams);
    render(page);

    expect(screen.getByText('Item ID: async-item-456')).toBeInTheDocument();
  });

  it('should pass itemId prop to ItemDetail component', async () => {
    const mockParams = {
      params: Promise.resolve({ id: 'prop-test-789' }),
    };

    const page = await ItemDetailPage(mockParams);
    render(page);

    expect(screen.getByText('Item ID: prop-test-789')).toBeInTheDocument();
  });

  it('should extract id from params correctly', async () => {
    const testId = '68fbe7e1ce0dbad3aab9a0bf';
    const mockParams = {
      params: Promise.resolve({ id: testId }),
    };

    const page = await ItemDetailPage(mockParams);
    render(page);

    expect(screen.getByText(`Item ID: ${testId}`)).toBeInTheDocument();
  });
});