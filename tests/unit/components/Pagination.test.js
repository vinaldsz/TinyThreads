import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '@/components/Pagination/Pagination';

describe('Pagination component', () => {
  test('renders pagination and calls onPageChange', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination
        page={2}
        total={90}
        limit={9}
        onPageChange={onPageChange}
        maxPagesToShow={5}
      />,
    );

    // should show Prev/Next and numbered pages
    expect(screen.getByRole('button', { name: /Prev/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();

    // page 2 button should be present and aria-current
    const btn2 = screen.getByRole('button', { name: '2' });
    expect(btn2).toBeInTheDocument();
    expect(btn2).toHaveAttribute('aria-current', 'page');

    // click another page
    const btn3 = screen.getByRole('button', { name: '3' });
    fireEvent.click(btn3);
    expect(onPageChange).toHaveBeenCalledWith(3);

    // click Prev
    const prev = screen.getByRole('button', { name: /Prev/i });
    fireEvent.click(prev);
    expect(onPageChange).toHaveBeenCalledWith(1);

    // click Next
    const next = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(next);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test('does not render when only one page', () => {
    const onPageChange = jest.fn();
    const { container } = render(
      <Pagination page={1} total={5} limit={10} onPageChange={onPageChange} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
