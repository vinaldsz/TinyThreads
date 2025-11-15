// src/types/__tests__/item.test.js
import {
  ITEM_CONFIG,
  ITEM_SCHEMA,
  createItem,
  validateItem,
  getFilterOptions,
  exampleItem,
} from '@/types/item';

describe('item.js types and utilities', () => {
  // ===== ITEM_CONFIG TESTS =====
  describe('ITEM_CONFIG', () => {
    test('has all required condition values', () => {
      expect(ITEM_CONFIG.CONDITIONS).toEqual([
        'New',
        'Like New',
        'Good',
        'Fair',
      ]);
      expect(ITEM_CONFIG.CONDITIONS).toHaveLength(4);
    });

    test('has all required category values', () => {
      expect(ITEM_CONFIG.CATEGORIES).toEqual([
        'Clothing',
        'Toys',
        'Books',
        'Gear',
        'Other',
      ]);
      expect(ITEM_CONFIG.CATEGORIES).toHaveLength(5);
    });

    test('has comprehensive age ranges', () => {
      expect(ITEM_CONFIG.AGE_RANGES).toEqual([
        '0-3 months',
        '3-6 months',
        '6-12 months',
        '12-18 months',
        '18-24 months',
        '2-3 years',
        '3+ years',
      ]);
      expect(ITEM_CONFIG.AGE_RANGES).toHaveLength(7);
    });

    test('has proper default values', () => {
      expect(ITEM_CONFIG.DEFAULTS.category).toBe('Clothing');
      expect(ITEM_CONFIG.DEFAULTS.condition).toBe('Good');
      expect(typeof ITEM_CONFIG.DEFAULTS.createdAt).toBe('function');
    });

    test('createdAt default function returns ISO string', () => {
      const timestamp = ITEM_CONFIG.DEFAULTS.createdAt();
      expect(typeof timestamp).toBe('string');
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
      expect(timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    test('all arrays contain only strings', () => {
      ITEM_CONFIG.CONDITIONS.forEach((condition) => {
        expect(typeof condition).toBe('string');
        expect(condition.length).toBeGreaterThan(0);
      });

      ITEM_CONFIG.CATEGORIES.forEach((category) => {
        expect(typeof category).toBe('string');
        expect(category.length).toBeGreaterThan(0);
      });

      ITEM_CONFIG.AGE_RANGES.forEach((range) => {
        expect(typeof range).toBe('string');
        expect(range.length).toBeGreaterThan(0);
      });
    });
  });

  // ===== ITEM_SCHEMA TESTS =====
  describe('ITEM_SCHEMA', () => {
    test('has all expected fields', () => {
      const expectedFields = [
        'id',
        'title',
        'price',
        'size',
        'condition',
        'imageUrl',
        'description',
        'sellerId',
        'sellerName',
        'category',
        'ageRange',
        'createdAt',
      ];

      expectedFields.forEach((field) => {
        expect(ITEM_SCHEMA[field]).toBeDefined();
      });
    });

    test('required fields are correctly marked', () => {
      const requiredFields = [
        'id',
        'title',
        'price',
        'size',
        'condition',
        'imageUrl',
        'description',
        'sellerId',
        'sellerName',
        'ageRange',
      ];
      const optionalFields = ['category', 'createdAt'];

      requiredFields.forEach((field) => {
        expect(ITEM_SCHEMA[field].required).toBe(true);
      });

      optionalFields.forEach((field) => {
        expect(ITEM_SCHEMA[field].required).toBe(false);
      });
    });

    test('field types are correctly specified', () => {
      expect(ITEM_SCHEMA.id.type).toBe('string');
      expect(ITEM_SCHEMA.title.type).toBe('string');
      expect(ITEM_SCHEMA.price.type).toBe('number');
      expect(ITEM_SCHEMA.size.type).toBe('string');
      expect(ITEM_SCHEMA.condition.type).toBe('string');
      expect(ITEM_SCHEMA.imageUrl.type).toBe('string');
      expect(ITEM_SCHEMA.description.type).toBe('string');
      expect(ITEM_SCHEMA.sellerId.type).toBe('string');
      expect(ITEM_SCHEMA.sellerName.type).toBe('string');
      expect(ITEM_SCHEMA.category.type).toBe('string');
      expect(ITEM_SCHEMA.ageRange.type).toBe('string');
      expect(ITEM_SCHEMA.createdAt.type).toBe('string');
    });

    test('constrained fields have proper values arrays', () => {
      expect(ITEM_SCHEMA.condition.values).toEqual(ITEM_CONFIG.CONDITIONS);
      expect(ITEM_SCHEMA.category.values).toEqual(ITEM_CONFIG.CATEGORIES);
      expect(ITEM_SCHEMA.ageRange.values).toEqual(ITEM_CONFIG.AGE_RANGES);
    });

    test('default values are properly referenced', () => {
      expect(ITEM_SCHEMA.category.default).toBe(ITEM_CONFIG.DEFAULTS.category);
      expect(ITEM_SCHEMA.createdAt.default).toBe(
        ITEM_CONFIG.DEFAULTS.createdAt,
      );
    });
  });

  // ===== createItem FUNCTION TESTS =====
  describe('createItem', () => {
    const validItemData = {
      id: 'test-123',
      title: 'Test Baby Onesie',
      price: 19.99,
      size: '6-12M',
      condition: 'Like New',
      imageUrl: 'https://example.com/image.jpg',
      description: 'Beautiful baby onesie',
      sellerId: 'seller-456',
      sellerName: 'Jane Doe',
      ageRange: '6-12 months',
    };

    test('creates item with all required fields', () => {
      const item = createItem(validItemData);

      expect(item).toEqual({
        ...validItemData,
        category: 'Clothing', // default applied
        createdAt: expect.any(String), // default applied
      });
    });

    test('applies default category when not provided', () => {
      const item = createItem(validItemData);

      expect(item.category).toBe('Clothing');
    });

    test('applies default createdAt when not provided', () => {
      const item = createItem(validItemData);

      expect(typeof item.createdAt).toBe('string');
      expect(new Date(item.createdAt).toISOString()).toBe(item.createdAt);
    });

    test('preserves provided category and createdAt', () => {
      const customData = {
        ...validItemData,
        category: 'Toys',
        createdAt: '2023-01-01T12:00:00.000Z',
      };

      const item = createItem(customData);

      expect(item.category).toBe('Toys');
      expect(item.createdAt).toBe('2023-01-01T12:00:00.000Z');
    });

    test('calls console.warn for validation errors', () => {
      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const invalidData = {
        ...validItemData,
        condition: 'Invalid Condition',
      };

      createItem(invalidData);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Item validation warnings:',
        expect.arrayContaining([
          expect.stringContaining('Invalid value for condition'),
        ]),
      );

      consoleSpy.mockRestore();
    });

    test('does not warn for valid items', () => {
      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      createItem(validItemData);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('handles items with missing optional fields', () => {
      const minimalData = {
        ...validItemData,
        // category and createdAt will be defaulted
      };

      const item = createItem(minimalData);

      expect(item.category).toBe('Clothing');
      expect(item.createdAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    test('preserves all custom properties', () => {
      const customData = {
        ...validItemData,
        customField: 'custom value',
        anotherField: 123,
      };

      const item = createItem(customData);

      expect(item.customField).toBe('custom value');
      expect(item.anotherField).toBe(123);
    });
  });

  // ===== validateItem FUNCTION TESTS =====
  describe('validateItem', () => {
    const validItem = {
      id: 'test-123',
      title: 'Test Baby Onesie',
      price: 19.99,
      size: '6-12M',
      condition: 'Like New',
      imageUrl: 'https://example.com/image.jpg',
      description: 'Beautiful baby onesie',
      sellerId: 'seller-456',
      sellerName: 'Jane Doe',
      category: 'Clothing',
      ageRange: '6-12 months',
      createdAt: '2023-01-01T12:00:00.000Z',
    };

    test('returns empty array for valid item', () => {
      const errors = validateItem(validItem);

      expect(errors).toEqual([]);
    });

    test('catches missing required fields', () => {
      const itemMissingFields = {
        id: 'test-123',
        // missing title, price, size, etc.
      };

      const errors = validateItem(itemMissingFields);

      expect(errors).toContain('Missing required field: title');
      expect(errors).toContain('Missing required field: price');
      expect(errors).toContain('Missing required field: size');
      expect(errors).toContain('Missing required field: condition');
      expect(errors).toContain('Missing required field: imageUrl');
      expect(errors).toContain('Missing required field: description');
      expect(errors).toContain('Missing required field: sellerId');
      expect(errors).toContain('Missing required field: sellerName');
      expect(errors).toContain('Missing required field: ageRange');
    });

    test('allows price to be zero', () => {
      const itemWithZeroPrice = {
        ...validItem,
        price: 0,
      };

      const errors = validateItem(itemWithZeroPrice);

      expect(errors).not.toContain('Missing required field: price');
    });

    test('catches invalid condition values', () => {
      const itemWithInvalidCondition = {
        ...validItem,
        condition: 'Invalid Condition',
      };

      const errors = validateItem(itemWithInvalidCondition);

      expect(errors).toContain(
        'Invalid value for condition: Invalid Condition. Must be one of: New, Like New, Good, Fair',
      );
    });

    test('catches invalid category values', () => {
      const itemWithInvalidCategory = {
        ...validItem,
        category: 'Invalid Category',
      };

      const errors = validateItem(itemWithInvalidCategory);

      expect(errors).toContain(
        'Invalid value for category: Invalid Category. Must be one of: Clothing, Toys, Books, Gear, Other',
      );
    });

    test('catches invalid age range values', () => {
      const itemWithInvalidAgeRange = {
        ...validItem,
        ageRange: 'Invalid Age Range',
      };

      const errors = validateItem(itemWithInvalidAgeRange);

      expect(errors).toContain(
        'Invalid value for ageRange: Invalid Age Range. Must be one of: 0-3 months, 3-6 months, 6-12 months, 12-18 months, 18-24 months, 2-3 years, 3+ years',
      );
    });

    test('catches multiple validation errors', () => {
      const invalidItem = {
        id: 'test-123',
        // missing title
        // missing price
        condition: 'Invalid',
        category: 'Invalid',
        ageRange: 'Invalid',
      };

      const errors = validateItem(invalidItem);

      expect(errors.length).toBeGreaterThan(5);
      expect(errors).toContain('Missing required field: title');
      expect(errors).toContain('Missing required field: price');
      expect(
        errors.some((error) => error.includes('Invalid value for condition')),
      ).toBe(true);
      expect(
        errors.some((error) => error.includes('Invalid value for category')),
      ).toBe(true);
      expect(
        errors.some((error) => error.includes('Invalid value for ageRange')),
      ).toBe(true);
    });

    test('ignores validation for optional missing fields', () => {
      const itemWithoutOptionalFields = {
        ...validItem,
        category: undefined,
        createdAt: undefined,
      };

      const errors = validateItem(itemWithoutOptionalFields);

      expect(errors).not.toContain('Missing required field: category');
      expect(errors).not.toContain('Missing required field: createdAt');
    });

    test('validates fields that are empty strings', () => {
      const itemWithEmptyStrings = {
        ...validItem,
        title: '',
        description: '',
      };

      const errors = validateItem(itemWithEmptyStrings);

      expect(errors).toContain('Missing required field: title');
      expect(errors).toContain('Missing required field: description');
    });

    test('validates fields that are null', () => {
      const itemWithNullFields = {
        ...validItem,
        title: null,
        sellerId: null,
      };

      const errors = validateItem(itemWithNullFields);

      expect(errors).toContain('Missing required field: title');
      expect(errors).toContain('Missing required field: sellerId');
    });

    test('validates fields that are undefined', () => {
      const itemWithUndefinedFields = {
        ...validItem,
        imageUrl: undefined,
        sellerName: undefined,
      };

      const errors = validateItem(itemWithUndefinedFields);

      expect(errors).toContain('Missing required field: imageUrl');
      expect(errors).toContain('Missing required field: sellerName');
    });
  });

  // ===== getFilterOptions FUNCTION TESTS =====
  describe('getFilterOptions', () => {
    test('returns all filter options', () => {
      const options = getFilterOptions();

      expect(options).toEqual({
        conditions: ITEM_CONFIG.CONDITIONS,
        categories: ITEM_CONFIG.CATEGORIES,
        ageRanges: ITEM_CONFIG.AGE_RANGES,
      });
    });

    test('returns proper array references', () => {
      const options = getFilterOptions();

      expect(options.conditions).toBe(ITEM_CONFIG.CONDITIONS);
      expect(options.categories).toBe(ITEM_CONFIG.CATEGORIES);
      expect(options.ageRanges).toBe(ITEM_CONFIG.AGE_RANGES);
    });

    test('all returned arrays are non-empty', () => {
      const options = getFilterOptions();

      expect(options.conditions.length).toBeGreaterThan(0);
      expect(options.categories.length).toBeGreaterThan(0);
      expect(options.ageRanges.length).toBeGreaterThan(0);
    });

    test('returns expected structure for UI consumption', () => {
      const options = getFilterOptions();

      // Should have exactly these keys
      expect(Object.keys(options)).toEqual([
        'conditions',
        'categories',
        'ageRanges',
      ]);

      // Each should be an array
      expect(Array.isArray(options.conditions)).toBe(true);
      expect(Array.isArray(options.categories)).toBe(true);
      expect(Array.isArray(options.ageRanges)).toBe(true);
    });
  });

  // ===== exampleItem TESTS =====
  describe('exampleItem', () => {
    test('is created successfully', () => {
      expect(exampleItem).toBeDefined();
      expect(typeof exampleItem).toBe('object');
    });

    test('has all required fields', () => {
      expect(exampleItem.id).toBe('example-1');
      expect(exampleItem.title).toBe('Cotton Baby Onesie');
      expect(exampleItem.price).toBe(15.99);
      expect(exampleItem.size).toBe('6-12 months');
      expect(exampleItem.condition).toBe('Like New');
      expect(exampleItem.imageUrl).toBe('https://example.com/onesie.jpg');
      expect(exampleItem.description).toBe(
        'Soft organic cotton onesie, barely worn',
      );
      expect(exampleItem.sellerId).toBe('user123');
      expect(exampleItem.sellerName).toBe('Sarah M.');
      expect(exampleItem.ageRange).toBe('6-12 months');
    });

    test('has default values applied', () => {
      expect(exampleItem.category).toBe('Clothing');
      expect(typeof exampleItem.createdAt).toBe('string');
      expect(new Date(exampleItem.createdAt).toISOString()).toBe(
        exampleItem.createdAt,
      );
    });

    test('passes validation', () => {
      const errors = validateItem(exampleItem);

      expect(errors).toEqual([]);
    });

    test('was created using createItem function', () => {
      // Test that it matches the pattern of createItem output
      const recreated = createItem({
        id: 'example-1',
        title: 'Cotton Baby Onesie',
        price: 15.99,
        size: '6-12 months',
        condition: 'Like New',
        imageUrl: 'https://example.com/onesie.jpg',
        description: 'Soft organic cotton onesie, barely worn',
        sellerId: 'user123',
        sellerName: 'Sarah M.',
        ageRange: '6-12 months',
      });

      // Should have same structure (though createdAt will be different)
      expect(exampleItem.id).toBe(recreated.id);
      expect(exampleItem.title).toBe(recreated.title);
      expect(exampleItem.category).toBe(recreated.category);
    });
  });

  // ===== INTEGRATION TESTS =====
  describe('integration scenarios', () => {
    test('complete workflow: create and validate item', () => {
      const itemData = {
        id: 'integration-test',
        title: 'Test Item',
        price: 25.0,
        size: 'M',
        condition: 'Good',
        imageUrl: 'https://example.com/test.jpg',
        description: 'Test description',
        sellerId: 'test-seller',
        sellerName: 'Test Seller',
        ageRange: '12-18 months',
        category: 'Toys',
      };

      const item = createItem(itemData);
      const errors = validateItem(item);

      expect(errors).toEqual([]);
      expect(item.category).toBe('Toys');
      expect(typeof item.createdAt).toBe('string');
    });

    test('filter options match schema constraints', () => {
      const options = getFilterOptions();

      expect(options.conditions).toEqual(ITEM_SCHEMA.condition.values);
      expect(options.categories).toEqual(ITEM_SCHEMA.category.values);
      expect(options.ageRanges).toEqual(ITEM_SCHEMA.ageRange.values);
    });

    test('all config conditions are valid in schema', () => {
      ITEM_CONFIG.CONDITIONS.forEach((condition) => {
        const testItem = {
          ...exampleItem,
          condition: condition,
        };

        const errors = validateItem(testItem);
        const conditionErrors = errors.filter((error) =>
          error.includes('condition'),
        );

        expect(conditionErrors).toHaveLength(0);
      });
    });

    test('all config categories are valid in schema', () => {
      ITEM_CONFIG.CATEGORIES.forEach((category) => {
        const testItem = {
          ...exampleItem,
          category: category,
        };

        const errors = validateItem(testItem);
        const categoryErrors = errors.filter((error) =>
          error.includes('category'),
        );

        expect(categoryErrors).toHaveLength(0);
      });
    });

    test('all config age ranges are valid in schema', () => {
      ITEM_CONFIG.AGE_RANGES.forEach((ageRange) => {
        const testItem = {
          ...exampleItem,
          ageRange: ageRange,
        };

        const errors = validateItem(testItem);
        const ageRangeErrors = errors.filter((error) =>
          error.includes('ageRange'),
        );

        expect(ageRangeErrors).toHaveLength(0);
      });
    });
  });

  // ===== EDGE CASES =====
  describe('edge cases', () => {
    test('handles items with extra properties', () => {
      const itemWithExtras = {
        ...exampleItem,
        extraField: 'extra value',
        customProperty: { nested: 'object' },
      };

      const errors = validateItem(itemWithExtras);
      expect(errors).toEqual([]);
    });

    test('handles empty object validation', () => {
      const errors = validateItem({});

      // Should have many missing field errors
      expect(errors.length).toBeGreaterThan(8);
    });

    test('validates case sensitivity', () => {
      const itemWithWrongCase = {
        ...exampleItem,
        condition: 'like new', // lowercase
        category: 'clothing', // lowercase
      };

      const errors = validateItem(itemWithWrongCase);

      expect(
        errors.some((error) => error.includes('Invalid value for condition')),
      ).toBe(true);
      expect(
        errors.some((error) => error.includes('Invalid value for category')),
      ).toBe(true);
    });

    test('handles numeric strings for price validation', () => {
      // Note: The schema expects number type for price
      const itemWithStringPrice = {
        ...exampleItem,
        price: '19.99', // string instead of number
      };

      const errors = validateItem(itemWithStringPrice);
      // This would be caught by type checking if implemented
      expect(errors).toEqual([]); // Currently only validates presence and values, not types
    });
  });
});
