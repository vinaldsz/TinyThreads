// src/app/add-listing/__tests__/page.test.js
import { render, screen } from '@testing-library/react'
import { redirect } from 'next/navigation'
import AddListingPage, { uploadListingAction } from '../page'
import { uploadImageToS3 } from '../../../lib/awss3'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

// Mock AWS S3 upload
jest.mock('../../../lib/awss3', () => ({
  uploadImageToS3: jest.fn()
}))

// Mock MongoDB
const mockCollection = {
  insertOne: jest.fn()
}
const mockDb = {
  collection: jest.fn(() => mockCollection)
}
const mockClient = {
  db: jest.fn(() => mockDb)
}

jest.mock('../../../lib/mongodb', () => ({
  default: Promise.resolve(mockClient)
}))

describe('Add Listing Page', () => {
  beforeEach(() => {
    redirect.mockClear()
    uploadImageToS3.mockClear()
    mockCollection.insertOne.mockClear()
    mockDb.collection.mockClear()
    mockClient.db.mockClear()
  })

  // ===== REACT COMPONENT TESTS =====
  describe('AddListingPage Component', () => {
    test('renders page header correctly', () => {
      render(<AddListingPage />)
      
      expect(screen.getByText('👶')).toBeInTheDocument()
      expect(screen.getByText('Add New Listing')).toBeInTheDocument()
    })

    test('renders all form fields', () => {
      render(<AddListingPage />)
      
      // Check all form inputs
      expect(screen.getByLabelText('Title')).toBeInTheDocument()
      expect(screen.getByLabelText('Category')).toBeInTheDocument()
      expect(screen.getByLabelText('Size')).toBeInTheDocument()
      expect(screen.getByLabelText('Age Range')).toBeInTheDocument()
      expect(screen.getByLabelText('Location')).toBeInTheDocument()
      expect(screen.getByLabelText('Seller ID')).toBeInTheDocument()
      expect(screen.getByLabelText('Condition')).toBeInTheDocument()
      expect(screen.getByLabelText('Price ($)')).toBeInTheDocument()
      expect(screen.getByLabelText('Upload Image')).toBeInTheDocument()
      expect(screen.getByLabelText('Description')).toBeInTheDocument()
    })

    test('has required attributes on required fields', () => {
      render(<AddListingPage />)
      
      expect(screen.getByLabelText('Title')).toHaveAttribute('required')
      expect(screen.getByLabelText('Category')).toHaveAttribute('required')
      expect(screen.getByLabelText('Condition')).toHaveAttribute('required')
      expect(screen.getByLabelText('Price ($)')).toHaveAttribute('required')
      expect(screen.getByLabelText('Upload Image')).toHaveAttribute('required')
    })

    test('has correct input types and constraints', () => {
      render(<AddListingPage />)
      
      const priceInput = screen.getByLabelText('Price ($)')
      expect(priceInput).toHaveAttribute('type', 'number')
      expect(priceInput).toHaveAttribute('min', '0')
      expect(priceInput).toHaveAttribute('step', '0.01')
      
      const imageInput = screen.getByLabelText('Upload Image')
      expect(imageInput).toHaveAttribute('type', 'file')
      expect(imageInput).toHaveAttribute('accept', 'image/*')
      
      const titleInput = screen.getByLabelText('Title')
      expect(titleInput).toHaveAttribute('type', 'text')
    })

    test('renders all category options', () => {
      render(<AddListingPage />)
      
      const categorySelect = screen.getByLabelText('Category')
      
      expect(categorySelect).toContainHTML('<option value="">Select category</option>')
      expect(categorySelect).toContainHTML('<option value="clothing">Clothing</option>')
      expect(categorySelect).toContainHTML('<option value="toys">Toys</option>')
      expect(categorySelect).toContainHTML('<option value="books">Books</option>')
      expect(categorySelect).toContainHTML('<option value="gear">Baby Gear</option>')
    })

    test('renders all condition options', () => {
      render(<AddListingPage />)
      
      const conditionSelect = screen.getByLabelText('Condition')
      
      expect(conditionSelect).toContainHTML('<option value="">Select condition</option>')
      expect(conditionSelect).toContainHTML('<option value="new">New</option>')
      expect(conditionSelect).toContainHTML('<option value="like-new">Like New</option>')
      expect(conditionSelect).toContainHTML('<option value="good">Good</option>')
      expect(conditionSelect).toContainHTML('<option value="fair">Fair</option>')
    })

    test('has correct form action', () => {
      render(<AddListingPage />)
      
      const form = screen.getByRole('form') || document.querySelector('form')
      expect(form).toHaveAttribute('id', 'addListingForm')
    })

    test('renders action buttons', () => {
      render(<AddListingPage />)
      
      expect(screen.getByRole('button', { name: 'Add Listing' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Add Listing' })).toHaveAttribute('type', 'submit')
      
      const cancelLink = screen.getByRole('link', { name: 'Cancel' })
      expect(cancelLink).toBeInTheDocument()
      expect(cancelLink).toHaveAttribute('href', '/')
    })

    test('has proper form structure', () => {
      render(<AddListingPage />)
      
      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
      
      // Should have proper CSS classes
      expect(form).toHaveClass('listingForm')
    })

    test('has proper placeholder text', () => {
      render(<AddListingPage />)
      
      expect(screen.getByPlaceholderText('e.g. Organic Cotton Onesie - Pink')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g. 0-3 months')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('City, State (e.g., Fremont, CA)')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('seller1')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g. 20.00')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Add a short description of the item...')).toBeInTheDocument()
    })

    test('textarea has correct attributes', () => {
      render(<AddListingPage />)
      
      const textarea = screen.getByLabelText('Description')
      expect(textarea.tagName).toBe('TEXTAREA')
      expect(textarea).toHaveAttribute('rows', '4')
    })
  })

  // ===== SERVER ACTION TESTS =====
  describe('uploadListingAction', () => {
    let mockFormData
    let mockFile

    beforeEach(() => {
      mockFile = {
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
        name: 'test-image.jpg',
        type: 'image/jpeg'
      }

      mockFormData = new Map([
        ['title', 'Test Baby Onesie'],
        ['category', 'clothing'],
        ['condition', 'like-new'],
        ['price', '19.99'],
        ['size', '6M'],
        ['ageRange', '3-6 months'],
        ['location', 'Fremont, CA'],
        ['sellerId', 'test-seller'],
        ['description', 'Beautiful baby onesie'],
        ['image', mockFile]
      ])

      // Mock FormData.get method
      mockFormData.get = jest.fn((key) => {
        return mockFormData.get(key) || null
      })

      uploadImageToS3.mockResolvedValue({
        key: 'items/item-12345.jpg',
        imageUrl: 'https://bucket.s3.amazonaws.com/items/item-12345.jpg'
      })

      mockCollection.insertOne.mockResolvedValue({
        insertedId: 'new-item-id'
      })
    })

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
            sellerId: 'test-seller',
            description: 'Beautiful baby onesie',
            image: mockFile
          }
          return data[key] || null
        })
      }

      await uploadListingAction(formData)

      // Should upload image to S3
      expect(uploadImageToS3).toHaveBeenCalledWith(mockFile, {
        folder: 'items',
        filenamePrefix: 'item'
      })

      // Should insert into MongoDB
      expect(mockCollection.insertOne).toHaveBeenCalledWith({
        title: 'Test Baby Onesie',
        price: 19.99,
        size: '6M',
        condition: 'like-new',
        imageUrls: ['https://bucket.s3.amazonaws.com/items/item-12345.jpg'],
        description: 'Beautiful baby onesie',
        sellerId: 'test-seller',
        category: 'clothing',
        ageRange: '3-6 months',
        location: 'Fremont, CA',
        status: 'available',
        createdAt: expect.any(Date)
      })

      // Should redirect to home
      expect(redirect).toHaveBeenCalledWith('/')
    })

    test('uses default sellerId when not provided', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'clothing',
            condition: 'good',
            price: '10.00',
            image: mockFile,
            sellerId: null // Not provided
          }
          return data[key] || null
        })
      }

      await uploadListingAction(formData)

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          sellerId: 'seller1' // Default value
        })
      )
    })

    test('handles empty optional fields gracefully', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'toys',
            condition: 'new',
            price: '25.00',
            image: mockFile,
            // Missing optional fields
            size: null,
            ageRange: null,
            location: null,
            description: null
          }
          return data[key] || null
        })
      }

      await uploadListingAction(formData)

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          size: '',
          ageRange: '',
          location: '',
          description: ''
        })
      )
    })

    test('converts form data to correct types', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'books',
            condition: 'fair',
            price: '15.50', // String that should be converted to number
            size: 'Large',
            ageRange: '2-3 years',
            location: 'San Jose, CA',
            sellerId: 'seller123',
            description: 'Great book!',
            image: mockFile
          }
          return data[key]
        })
      }

      await uploadListingAction(formData)

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Item', // String
          price: 15.50, // Number
          size: 'Large', // String
          condition: 'fair', // String
          sellerId: 'seller123', // String
          category: 'books', // String
          ageRange: '2-3 years', // String
          location: 'San Jose, CA', // String
          status: 'available', // Default
          createdAt: expect.any(Date)
        })
      )
    })

    test('redirects back to add-listing when no file provided', async () => {
      const formData = {
        get: jest.fn((key) => {
          if (key === 'image') return null // No file
          return 'some value'
        })
      }

      await uploadListingAction(formData)

      expect(redirect).toHaveBeenCalledWith('/add-listing')
      expect(uploadImageToS3).not.toHaveBeenCalled()
      expect(mockCollection.insertOne).not.toHaveBeenCalled()
    })

    test('redirects back when file is string', async () => {
      const formData = {
        get: jest.fn((key) => {
          if (key === 'image') return 'not-a-file' // String instead of File
          return 'some value'
        })
      }

      await uploadListingAction(formData)

      expect(redirect).toHaveBeenCalledWith('/add-listing')
      expect(uploadImageToS3).not.toHaveBeenCalled()
    })

    test('redirects back when file lacks arrayBuffer method', async () => {
      const invalidFile = {
        name: 'test.jpg'
        // Missing arrayBuffer method
      }

      const formData = {
        get: jest.fn((key) => {
          if (key === 'image') return invalidFile
          return 'some value'
        })
      }

      await uploadListingAction(formData)

      expect(redirect).toHaveBeenCalledWith('/add-listing')
      expect(uploadImageToS3).not.toHaveBeenCalled()
    })

    test('handles S3 upload errors gracefully', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'clothing',
            condition: 'good',
            price: '20.00',
            image: mockFile
          }
          return data[key]
        })
      }

      uploadImageToS3.mockRejectedValue(new Error('S3 upload failed'))

      await expect(uploadListingAction(formData)).rejects.toThrow('S3 upload failed')

      // Should not insert into database if S3 fails
      expect(mockCollection.insertOne).not.toHaveBeenCalled()
      expect(redirect).not.toHaveBeenCalled()
    })

    test('handles database insertion errors gracefully', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'clothing',
            condition: 'good',
            price: '20.00',
            image: mockFile
          }
          return data[key]
        })
      }

      mockCollection.insertOne.mockRejectedValue(new Error('Database error'))

      await expect(uploadListingAction(formData)).rejects.toThrow('Database error')

      // Should have tried S3 upload first
      expect(uploadImageToS3).toHaveBeenCalled()
      expect(redirect).not.toHaveBeenCalled()
    })

    test('uses correct database and collection names', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'gear',
            condition: 'new',
            price: '30.00',
            image: mockFile
          }
          return data[key]
        })
      }

      await uploadListingAction(formData)

      expect(mockClient.db).toHaveBeenCalledWith('TinyThreads')
      expect(mockDb.collection).toHaveBeenCalledWith('Listings')
    })

    test('sets status to available by default', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'other',
            condition: 'good',
            price: '5.00',
            image: mockFile
          }
          return data[key]
        })
      }

      await uploadListingAction(formData)

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'available'
        })
      )
    })

    test('includes imageUrls as array with S3 URL', async () => {
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'clothing',
            condition: 'like-new',
            price: '12.99',
            image: mockFile
          }
          return data[key]
        })
      }

      uploadImageToS3.mockResolvedValue({
        key: 'items/item-custom.jpg',
        imageUrl: 'https://custom-url.com/item-custom.jpg'
      })

      await uploadListingAction(formData)

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          imageUrls: ['https://custom-url.com/item-custom.jpg']
        })
      )
    })

    test('sets createdAt to current date', async () => {
      const beforeTime = new Date()
      
      const formData = {
        get: jest.fn((key) => {
          const data = {
            title: 'Test Item',
            category: 'toys',
            condition: 'good',
            price: '8.50',
            image: mockFile
          }
          return data[key]
        })
      }

      await uploadListingAction(formData)

      const afterTime = new Date()
      const insertCall = mockCollection.insertOne.mock.calls[0][0]
      
      expect(insertCall.createdAt).toBeInstanceOf(Date)
      expect(insertCall.createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
      expect(insertCall.createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime())
    })
  })

  // ===== INTEGRATION TESTS =====
  describe('integration scenarios', () => {
    test('form and action work together with proper field mapping', () => {
      render(<AddListingPage />)
      
      // Verify form field names match what action expects
      expect(screen.getByLabelText('Title')).toHaveAttribute('name', 'title')
      expect(screen.getByLabelText('Category')).toHaveAttribute('name', 'category')
      expect(screen.getByLabelText('Condition')).toHaveAttribute('name', 'condition')
      expect(screen.getByLabelText('Price ($)')).toHaveAttribute('name', 'price')
      expect(screen.getByLabelText('Size')).toHaveAttribute('name', 'size')
      expect(screen.getByLabelText('Age Range')).toHaveAttribute('name', 'ageRange')
      expect(screen.getByLabelText('Location')).toHaveAttribute('name', 'location')
      expect(screen.getByLabelText('Seller ID')).toHaveAttribute('name', 'sellerId')
      expect(screen.getByLabelText('Upload Image')).toHaveAttribute('name', 'image')
      expect(screen.getByLabelText('Description')).toHaveAttribute('name', 'description')
    })

    test('category values match between form options and processing', () => {
      render(<AddListingPage />)
      
      const categorySelect = screen.getByLabelText('Category')
      const options = categorySelect.querySelectorAll('option[value]:not([value=""])')
      
      // Should have options that match expected categories
      const categoryValues = Array.from(options).map(option => option.value)
      expect(categoryValues).toEqual(['clothing', 'toys', 'books', 'gear'])
    })

    test('condition values match between form options and processing', () => {
      render(<AddListingPage />)
      
      const conditionSelect = screen.getByLabelText('Condition')
      const options = conditionSelect.querySelectorAll('option[value]:not([value=""])')
      
      const conditionValues = Array.from(options).map(option => option.value)
      expect(conditionValues).toEqual(['new', 'like-new', 'good', 'fair'])
    })
  })

  // ===== ACCESSIBILITY TESTS =====
  describe('accessibility', () => {
    test('has proper form labels', () => {
      render(<AddListingPage />)
      
      // All inputs should have associated labels
      const inputs = document.querySelectorAll('input, select, textarea')
      inputs.forEach(input => {
        if (input.id) {
          const label = document.querySelector(`label[for="${input.id}"]`)
          expect(label).toBeInTheDocument()
        }
      })
    })

    test('has proper heading hierarchy', () => {
      render(<AddListingPage />)
      
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('Add New Listing')
    })

    test('form has accessible structure', () => {
      render(<AddListingPage />)
      
      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
      
      // Should have submit button
      const submitButton = screen.getByRole('button', { name: 'Add Listing' })
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    test('required fields are marked as required', () => {
      render(<AddListingPage />)
      
      const requiredFields = [
        'title', 'category', 'condition', 'price', 'image'
      ]
      
      requiredFields.forEach(fieldName => {
        const field = document.querySelector(`[name="${fieldName}"]`)
        expect(field).toHaveAttribute('required')
      })
    })
  })
})