// src/components/__tests__/ItemDetail.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import ItemDetail from '../ItemDetail/ItemDetail'
import { getItemById } from '../../services/itemService'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock itemService
jest.mock('../../services/itemService', () => ({
  getItemById: jest.fn()
}))

describe('ItemDetail Component', () => {
  const mockRouter = {
    back: jest.fn()
  }

  const mockItem = {
    id: 'test-item-id',
    title: 'Baby Onesie 6M',
    price: 15.99,
    condition: 'Like New',
    size: '6M',
    ageRange: '3-6 months',
    category: 'Clothing',
    location: 'Fremont, CA',
    description: 'Cute baby onesie in excellent condition',
    imageUrl: 'https://example.com/onesie.jpg',
    status: 'available'
  }

  beforeEach(() => {
    useRouter.mockReturnValue(mockRouter)
    mockRouter.back.mockClear()
    getItemById.mockClear()
    
    // Set NODE_ENV to avoid console.log in tests
    process.env.NODE_ENV = 'production'
  })

  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = 'test'
  })

  // ===== LOADING STATE TESTS =====
  describe('loading state', () => {
    test('shows loading spinner and text when loading', async () => {
      // Mock getItemById to never resolve
      getItemById.mockImplementation(() => new Promise(() => {}))
      
      render(<ItemDetail itemId="test-id" />)
      
      expect(screen.getByText('Loading item details...')).toBeInTheDocument()
      expect(document.querySelector('[class*="loadingSpinner"]')).toBeInTheDocument()
    })

    test('does not render item content while loading', async () => {
      getItemById.mockImplementation(() => new Promise(() => {}))
      
      render(<ItemDetail itemId="test-id" />)
      
      expect(screen.queryByText('Back to Browse')).not.toBeInTheDocument()
      expect(screen.queryByText('← Go Back')).not.toBeInTheDocument()
    })
  })

  // ===== SUCCESSFUL ITEM DISPLAY TESTS =====
  describe('successful item display', () => {
    beforeEach(() => {
      getItemById.mockResolvedValue(mockItem)
    })

    test('renders item details correctly', async () => {
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('Baby Onesie 6M')).toBeInTheDocument()
      })

      expect(screen.getByText('$15.99')).toBeInTheDocument()
      expect(screen.getByText('Like New')).toBeInTheDocument()
      expect(screen.getByText('6M (3-6 months)')).toBeInTheDocument()
      expect(screen.getByText('Clothing')).toBeInTheDocument()
      expect(screen.getByText('Fremont, CA')).toBeInTheDocument()
      expect(screen.getByText('Cute baby onesie in excellent condition')).toBeInTheDocument()
    })

    test('displays image when imageUrl provided', async () => {
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        const image = screen.getByAltText('Baby Onesie 6M')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('src', 'https://example.com/onesie.jpg')
      })
    })

    test('shows available status badge', async () => {
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('✓ Available')).toBeInTheDocument()
      })
    })

    test('shows back button', async () => {
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('← Back to Browse')).toBeInTheDocument()
      })
    })

    test('shows safety notice', async () => {
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('🛡️ Safety Tips')).toBeInTheDocument()
        expect(screen.getByText(/Meet in a public place/)).toBeInTheDocument()
        expect(screen.getByText(/Bring a friend/)).toBeInTheDocument()
        expect(screen.getByText(/Inspect items carefully/)).toBeInTheDocument()
        expect(screen.getByText(/Trust your instincts/)).toBeInTheDocument()
      })
    })
  })

  // ===== ITEM NOT FOUND TESTS =====
  describe('item not found state', () => {
    test('shows not found message when item is null', async () => {
      getItemById.mockResolvedValue(null)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('Item Not Found')).toBeInTheDocument()
      })

      expect(screen.getByText("The item you're looking for doesn't exist or has been removed.")).toBeInTheDocument()
      expect(screen.getByText('← Go Back')).toBeInTheDocument()
    })

    test('shows not found message when getItemById throws error', async () => {
      getItemById.mockRejectedValue(new Error('Item not found'))
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('Item Not Found')).toBeInTheDocument()
      })
    })

    test('back button works in not found state', async () => {
      getItemById.mockResolvedValue(null)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        const backButton = screen.getByText('← Go Back')
        fireEvent.click(backButton)
        expect(mockRouter.back).toHaveBeenCalledTimes(1)
      })
    })
  })

  // ===== BACK BUTTON FUNCTIONALITY =====
  describe('back button functionality', () => {
    test('calls router.back when back button clicked', async () => {
      getItemById.mockResolvedValue(mockItem)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        const backButton = screen.getByText('← Back to Browse')
        fireEvent.click(backButton)
        expect(mockRouter.back).toHaveBeenCalledTimes(1)
      })
    })
  })

  // ===== PRICE FORMATTING TESTS =====
  describe('formatPrice function', () => {
    test('formats numeric prices correctly', async () => {
      const itemWithNumericPrice = { ...mockItem, price: 25 }
      getItemById.mockResolvedValue(itemWithNumericPrice)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('$25.00')).toBeInTheDocument()
      })
    })

    test('formats string prices correctly', async () => {
      const itemWithStringPrice = { ...mockItem, price: '12.5' }
      getItemById.mockResolvedValue(itemWithStringPrice)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('$12.50')).toBeInTheDocument()
      })
    })

    test('handles invalid price values', async () => {
      const itemWithInvalidPrice = { ...mockItem, price: 'invalid' }
      getItemById.mockResolvedValue(itemWithInvalidPrice)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('$invalid')).toBeInTheDocument()
      })
    })

    test('handles null/undefined price', async () => {
      const itemWithNullPrice = { ...mockItem, price: null }
      getItemById.mockResolvedValue(itemWithNullPrice)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('$')).toBeInTheDocument()
      })
    })

    test('handles decimal prices correctly', async () => {
      const itemWithDecimalPrice = { ...mockItem, price: 9.99 }
      getItemById.mockResolvedValue(itemWithDecimalPrice)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('$9.99')).toBeInTheDocument()
      })
    })
  })

  // ===== MISSING FIELD HANDLING =====
  describe('missing field handling', () => {
    test('handles missing image gracefully', async () => {
      const itemWithoutImage = { ...mockItem, imageUrl: null }
      getItemById.mockResolvedValue(itemWithoutImage)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('No image available')).toBeInTheDocument()
        expect(screen.queryByAltText('Baby Onesie 6M')).not.toBeInTheDocument()
      })
    })

    test('handles missing fields with dash fallbacks', async () => {
      const itemWithMissingFields = {
        ...mockItem,
        size: null,
        ageRange: '',
        category: undefined,
        location: '',
        description: null
      }
      getItemById.mockResolvedValue(itemWithMissingFields)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        // Should show dashes for missing fields
        const dashElements = screen.getAllByText('—')
        expect(dashElements.length).toBeGreaterThan(0)
      })
    })

    test('handles missing condition field', async () => {
      const itemWithoutCondition = { ...mockItem, condition: null }
      getItemById.mockResolvedValue(itemWithoutCondition)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('—')).toBeInTheDocument()
      })
    })

    test('shows size without age range when age range missing', async () => {
      const itemWithoutAgeRange = { ...mockItem, ageRange: null }
      getItemById.mockResolvedValue(itemWithoutAgeRange)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('6M')).toBeInTheDocument()
        expect(screen.queryByText('6M ()')).not.toBeInTheDocument()
      })
    })
  })

  // ===== STATUS HANDLING =====
  describe('status handling', () => {
    test('shows available status correctly', async () => {
      const availableItem = { ...mockItem, status: 'available' }
      getItemById.mockResolvedValue(availableItem)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('✓ Available')).toBeInTheDocument()
      })
    })

    test('shows other status values', async () => {
      const soldItem = { ...mockItem, status: 'sold' }
      getItemById.mockResolvedValue(soldItem)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('sold')).toBeInTheDocument()
      })
    })

    test('handles missing status', async () => {
      const itemWithoutStatus = { ...mockItem, status: null }
      getItemById.mockResolvedValue(itemWithoutStatus)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('—')).toBeInTheDocument()
      })
    })
  })

  // ===== CONDITION STYLING TESTS =====
  describe('condition styling', () => {
    test('applies correct CSS class for condition', async () => {
      const likeNewItem = { ...mockItem, condition: 'Like New' }
      getItemById.mockResolvedValue(likeNewItem)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        const conditionElement = screen.getByText('Like New')
        expect(conditionElement).toHaveClass('condition')
        // Should also apply the variant class (likenew)
        expect(conditionElement).toHaveClass('likenew')
      })
    })

    test('handles condition with spaces for CSS class', async () => {
      const fairConditionItem = { ...mockItem, condition: 'Fair' }
      getItemById.mockResolvedValue(fairConditionItem)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        const conditionElement = screen.getByText('Fair')
        expect(conditionElement).toHaveClass('condition')
        expect(conditionElement).toHaveClass('fair')
      })
    })

    test('handles unknown condition gracefully', async () => {
      const unknownConditionItem = { ...mockItem, condition: 'Unknown Condition' }
      getItemById.mockResolvedValue(unknownConditionItem)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        const conditionElement = screen.getByText('Unknown Condition')
        expect(conditionElement).toHaveClass('condition')
        // May or may not have variant class, but shouldn't crash
      })
    })
  })

  // ===== useEffect AND LIFECYCLE TESTS =====
  describe('useEffect and lifecycle', () => {
    test('calls getItemById when itemId provided', () => {
      render(<ItemDetail itemId="test-123" />)
      
      expect(getItemById).toHaveBeenCalledWith('test-123')
      expect(getItemById).toHaveBeenCalledTimes(1)
    })

    test('does not call getItemById when itemId is null', () => {
      render(<ItemDetail itemId={null} />)
      
      expect(getItemById).not.toHaveBeenCalled()
    })

    test('does not call getItemById when itemId is empty', () => {
      render(<ItemDetail itemId="" />)
      
      expect(getItemById).not.toHaveBeenCalled()
    })

    test('calls getItemById again when itemId changes', async () => {
      const { rerender } = render(<ItemDetail itemId="item-1" />)
      
      expect(getItemById).toHaveBeenCalledWith('item-1')
      
      rerender(<ItemDetail itemId="item-2" />)
      
      expect(getItemById).toHaveBeenCalledWith('item-2')
      expect(getItemById).toHaveBeenCalledTimes(2)
    })

    test('shows loading state during fetch', async () => {
      let resolvePromise
      getItemById.mockImplementation(() => {
        return new Promise(resolve => {
          resolvePromise = resolve
        })
      })
      
      render(<ItemDetail itemId="test-id" />)
      
      // Should show loading initially
      expect(screen.getByText('Loading item details...')).toBeInTheDocument()
      
      // Resolve the promise
      resolvePromise(mockItem)
      
      // Should show item content after loading
      await waitFor(() => {
        expect(screen.getByText('Baby Onesie 6M')).toBeInTheDocument()
      })
    })

    test('handles async error during fetch', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      getItemById.mockRejectedValue(new Error('Network error'))
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('Item Not Found')).toBeInTheDocument()
      })
      
      expect(consoleError).toHaveBeenCalledWith('Error fetching item:', expect.any(Error))
      
      consoleError.mockRestore()
    })
  })

  // ===== EDGE CASES =====
  describe('edge cases', () => {
    test('handles extremely long item title', async () => {
      const longTitleItem = {
        ...mockItem,
        title: 'A'.repeat(200) // Very long title
      }
      getItemById.mockResolvedValue(longTitleItem)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('A'.repeat(200))).toBeInTheDocument()
      })
    })

    test('handles item with all fields empty', async () => {
      const emptyItem = {
        id: 'empty-item',
        title: '',
        price: '',
        condition: '',
        size: '',
        ageRange: '',
        category: '',
        location: '',
        description: '',
        imageUrl: '',
        status: ''
      }
      getItemById.mockResolvedValue(emptyItem)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        // Should render without crashing
        expect(screen.getByText('No image available')).toBeInTheDocument()
        // Most fields should show dashes
        const dashElements = screen.getAllByText('—')
        expect(dashElements.length).toBeGreaterThan(0)
      })
    })

    test('handles non-development environment console logging', async () => {
      process.env.NODE_ENV = 'development'
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
      
      getItemById.mockResolvedValue(mockItem)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('Baby Onesie 6M')).toBeInTheDocument()
      })
      
      expect(consoleSpy).toHaveBeenCalledWith('ItemDetail loaded item:', mockItem)
      
      consoleSpy.mockRestore()
    })
  })

  // ===== ACCESSIBILITY =====
  describe('accessibility', () => {
    test('has proper heading structure', async () => {
      getItemById.mockResolvedValue(mockItem)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        const mainTitle = screen.getByRole('heading', { level: 1 })
        expect(mainTitle).toHaveTextContent('Baby Onesie 6M')
        
        const descriptionHeading = screen.getByRole('heading', { level: 3 })
        expect(descriptionHeading).toHaveTextContent('Description')
      })
    })

    test('has accessible image alt text', async () => {
      getItemById.mockResolvedValue(mockItem)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        const image = screen.getByRole('img')
        expect(image).toHaveAttribute('alt', 'Baby Onesie 6M')
      })
    })

    test('back buttons are keyboard accessible', async () => {
      getItemById.mockResolvedValue(mockItem)
      
      render(<ItemDetail itemId="test-id" />)
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back to browse/i })
        expect(backButton).toBeInTheDocument()
      })
    })
  })
})