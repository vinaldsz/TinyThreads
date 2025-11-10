// types/item.js

// ===== CENTRALIZED CONFIGURATION =====
export const ITEM_CONFIG = {
  // All possible values - easy to modify in one place
  CONDITIONS: ["New", "Like New", "Good", "Fair"],
  CATEGORIES: ["Clothing", "Toys", "Books", "Gear", "Other"],
  AGE_RANGES: [
    "0-3 months",
    "3-6 months",
    "6-12 months",
    "12-18 months",
    "18-24 months",
    "2-3 years",
    "3+ years",
  ],

  // Default values
  DEFAULTS: {
    category: "Clothing",
    condition: "Good",
    createdAt: () => new Date().toISOString(),
  },
};

// ===== ITEM SCHEMA =====
export const ITEM_SCHEMA = {
  id: { required: true, type: "string" },
  title: { required: true, type: "string" },
  price: { required: true, type: "number" },
  size: { required: true, type: "string" },
  condition: { required: true, type: "string", values: ITEM_CONFIG.CONDITIONS },
  imageUrl: { required: true, type: "string" },
  description: { required: true, type: "string" },
  sellerId: { required: true, type: "string" },
  sellerName: { required: true, type: "string" },
  category: {
    required: false,
    type: "string",
    values: ITEM_CONFIG.CATEGORIES,
    default: ITEM_CONFIG.DEFAULTS.category,
  },
  ageRange: { required: true, type: "string", values: ITEM_CONFIG.AGE_RANGES },
  createdAt: {
    required: false,
    type: "string",
    default: ITEM_CONFIG.DEFAULTS.createdAt,
  },
};

// ===== HELPER FUNCTIONS =====

// Create item with validation and defaults
export function createItem(itemData) {
  const item = {
    ...itemData,
    // Apply defaults for missing optional fields
    category: itemData.category || ITEM_CONFIG.DEFAULTS.category,
    createdAt: itemData.createdAt || ITEM_CONFIG.DEFAULTS.createdAt(),
  };

  // Validate the item
  const errors = validateItem(item);
  if (errors.length > 0) {
    console.warn("Item validation warnings:", errors);
  }

  return item;
}

// Validate item structure
export function validateItem(item) {
  const errors = [];

  Object.keys(ITEM_SCHEMA).forEach((field) => {
    const rules = ITEM_SCHEMA[field];
    const value = item[field];

    // Check required fields
    if (rules.required && !value && value !== 0) {
      errors.push(`Missing required field: ${field}`);
    }

    // Check valid values
    if (value && rules.values && !rules.values.includes(value)) {
      errors.push(
        `Invalid value for ${field}: ${value}. Must be one of: ${rules.values.join(
          ", "
        )}`
      );
    }
  });

  return errors;
}

// Get all filter options (useful for UI dropdowns)
export function getFilterOptions() {
  return {
    conditions: ITEM_CONFIG.CONDITIONS,
    categories: ITEM_CONFIG.CATEGORIES,
    ageRanges: ITEM_CONFIG.AGE_RANGES,
  };
}

// ===== EXAMPLE ITEM (for reference) =====
export const exampleItem = createItem({
  id: "example-1",
  title: "Cotton Baby Onesie",
  price: 15.99,
  size: "6-12 months",
  condition: "Like New",
  imageUrl: "https://example.com/onesie.jpg",
  description: "Soft organic cotton onesie, barely worn",
  sellerId: "user123",
  sellerName: "Sarah M.",
  ageRange: "6-12 months",
  // category and createdAt will use defaults
});
