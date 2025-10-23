// services/itemService.js
import { createItem, validateItem, getFilterOptions } from '../types/item';

// ===== MOCK DATA =====
const MOCK_ITEMS = [
  createItem({
    id: "1",
    title: "Organic Cotton Onesie - Pink",
    price: 18.99,
    size: "0-3 months",
    condition: "New",
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400",
    description: "Super soft organic cotton onesie in adorable pink. Perfect for newborns with sensitive skin.",
    sellerId: "seller1",
    sellerName: "Emma K.",
    category: "Clothing",
    ageRange: "0-3 months"
  }),

  createItem({
    id: "2", 
    title: "Baby Einstein Board Books Set",
    price: 25.00,
    size: "One Size",
    condition: "Like New",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    description: "Set of 4 colorful board books. Great for developing early reading skills.",
    sellerId: "seller2",
    sellerName: "Sarah M.",
    category: "Books",
    ageRange: "6-12 months"
  }),

  createItem({
    id: "3",
    title: "Wooden Stacking Rings Toy",
    price: 15.50,
    size: "One Size", 
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
    description: "Classic wooden stacking toy. Helps develop hand-eye coordination.",
    sellerId: "seller3",
    sellerName: "Mike D.",
    category: "Toys",
    ageRange: "6-12 months"
  }),

  createItem({
    id: "4",
    title: "Ergonomic Baby Carrier",
    price: 89.99,
    size: "Adjustable",
    condition: "Like New", 
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Comfortable baby carrier with lumbar support. Used only a few times.",
    sellerId: "seller4",
    sellerName: "Jennifer L.",
    category: "Gear",
    ageRange: "0-3 months"
  }),

  createItem({
    id: "5",
    title: "Striped Cotton Romper",
    price: 22.00,
    size: "6-12 months",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400",
    description: "Cute striped romper in blue and white. Perfect for summer.",
    sellerId: "seller1", 
    sellerName: "Emma K.",
    category: "Clothing",
    ageRange: "6-12 months"
  }),

  createItem({
    id: "6",
    title: "Soft Plush Teddy Bear",
    price: 12.99,
    size: "Medium",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1551798507-629020c74c8e?w=400",
    description: "Cuddly brown teddy bear, well-loved but clean. Great bedtime companion.",
    sellerId: "seller5",
    sellerName: "Amy T.",
    category: "Toys", 
    ageRange: "0-3 months"
  }),

  createItem({
    id: "7",
    title: "Baby's First Words Book",
    price: 8.50,
    size: "One Size",
    condition: "Fair",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    description: "Interactive book with simple words and pictures. Some page corners bent.",
    sellerId: "seller2",
    sellerName: "Sarah M.",
    category: "Books",
    ageRange: "12-18 months"
  }),

  createItem({
    id: "8",
    title: "High Chair - Convertible",
    price: 125.00,
    size: "Standard",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400",
    description: "Grows with your child! Converts to toddler chair. Minor scratches.",
    sellerId: "seller6",
    sellerName: "David R.",
    category: "Gear",
    ageRange: "6-12 months"
  }),

  createItem({
    id: "9",
    title: "Fleece Pajama Set - Dinosaurs",
    price: 16.75,
    size: "18-24 months", 
    condition: "Like New",
    imageUrl: "https://images.unsplash.com/photo-1519689373023-dd07c7988bb4?w=400",
    description: "Adorable dinosaur print pajamas. Worn only twice, outgrown quickly.",
    sellerId: "seller7",
    sellerName: "Lisa W.",
    category: "Clothing",
    ageRange: "18-24 months"
  }),

  createItem({
    id: "10",
    title: "Musical Activity Gym",
    price: 45.00,
    size: "Large",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
    description: "Colorful play mat with hanging toys and music. Battery compartment works well.",
    sellerId: "seller8",
    sellerName: "Rachel P.",
    category: "Toys",
    ageRange: "0-3 months"
  }),

  createItem({
    id: "11",
    title: "Alphabet Learning Cards",
    price: 11.25,
    size: "One Size",
    condition: "New",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    description: "Brand new flashcards for learning ABCs. Bright colors and fun illustrations.",
    sellerId: "seller9",
    sellerName: "Kevin H.",
    category: "Books",
    ageRange: "2-3 years"
  }),

  createItem({
    id: "12", 
    title: "Denim Overall Dress",
    price: 24.50,
    size: "12-18 months",
    condition: "Like New",
    imageUrl: "https://images.unsplash.com/photo-1519689373023-dd07c7988bb4?w=400",
    description: "Trendy denim overall dress with flower embroidery. Perfect condition.",
    sellerId: "seller10",
    sellerName: "Maria S.",
    category: "Clothing", 
    ageRange: "12-18 months"
  }),

  createItem({
    id: "13",
    title: "Stroller - Lightweight",
    price: 175.99,
    size: "Standard",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
    description: "Compact fold stroller, great for travel. One wheel needs minor adjustment.",
    sellerId: "seller4",
    sellerName: "Jennifer L.",
    category: "Gear",
    ageRange: "3-6 months"
  }),

  createItem({
    id: "14",
    title: "Shape Sorter Cube",
    price: 19.99,
    size: "Medium",
    condition: "Like New",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
    description: "Educational toy for learning shapes and colors. All pieces included.",
    sellerId: "seller11",
    sellerName: "Tom B.",
    category: "Toys",
    ageRange: "12-18 months"
  }),

  createItem({
    id: "15",
    title: "Nursery Rhymes Collection",
    price: 14.00,
    size: "One Size", 
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    description: "Classic nursery rhymes with beautiful illustrations. Some normal wear.",
    sellerId: "seller12",
    sellerName: "Nancy C.",
    category: "Books",
    ageRange: "18-24 months"
  }),

  createItem({
    id: "16",
    title: "Hooded Towel Set - Animals",
    price: 28.99,
    size: "One Size",
    condition: "New",
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400",
    description: "Set of 3 hooded towels with cute animal faces. Perfect baby shower gift.",
    sellerId: "seller13",
    sellerName: "Carol F.",
    category: "Other",
    ageRange: "0-3 months"
  }),

  createItem({
    id: "17",
    title: "Cozy Knit Sweater - Yellow",
    price: 32.50,
    size: "2-3 years",
    condition: "Like New",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400",
    description: "Hand-knit yellow sweater with button front. Grandma-made with love.",
    sellerId: "seller14", 
    sellerName: "Betty M.",
    category: "Clothing",
    ageRange: "2-3 years"
  }),

  createItem({
    id: "18",
    title: "Push & Pull Duck Toy",
    price: 21.75,
    size: "Medium",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
    description: "Classic wooden duck on wheels. Encourages walking and coordination.",
    sellerId: "seller15",
    sellerName: "Paul G.",
    category: "Toys",
    ageRange: "12-18 months"
  })
];

// ===== SERVICE FUNCTIONS =====

// Get all items (with optional pagination)
export async function getItems(page = 1, limit = 12) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = MOCK_ITEMS.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    total: MOCK_ITEMS.length,
    page: page,
    limit: limit,
    hasMore: endIndex < MOCK_ITEMS.length
  };
}

// Get single item by ID
export async function getItemById(id) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const item = MOCK_ITEMS.find(item => item.id === id);
  if (!item) {
    throw new Error(`Item with id ${id} not found`);
  }
  return item;
}

// Filter items based on criteria
export async function filterItems(filters = {}) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let filteredItems = [...MOCK_ITEMS];
  
  // Filter by category
  if (filters.category && filters.category !== 'All') {
    filteredItems = filteredItems.filter(item => item.category === filters.category);
  }
  
  // Filter by condition
  if (filters.condition && filters.condition !== 'All') {
    filteredItems = filteredItems.filter(item => item.condition === filters.condition);
  }
  
  // Filter by age range
  if (filters.ageRange && filters.ageRange !== 'All') {
    filteredItems = filteredItems.filter(item => item.ageRange === filters.ageRange);
  }
  
  // Filter by price range
  if (filters.minPrice !== undefined) {
    filteredItems = filteredItems.filter(item => item.price >= filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    filteredItems = filteredItems.filter(item => item.price <= filters.maxPrice);
  }
  
  // Search by title or description
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filteredItems = filteredItems.filter(item => 
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Sort by price or date
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-low':
        filteredItems.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredItems.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filteredItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filteredItems.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
    }
  }
  
  return {
    items: filteredItems,
    total: filteredItems.length,
    appliedFilters: filters
  };
}

// Search items (simple text search)
export async function searchItems(query) {
  return await filterItems({ searchTerm: query });
}

// Get items by seller
export async function getItemsBySeller(sellerId) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const sellerItems = MOCK_ITEMS.filter(item => item.sellerId === sellerId);
  return {
    items: sellerItems,
    total: sellerItems.length
  };
}

// Get filter options for UI dropdowns
export function getAvailableFilters() {
  return getFilterOptions();
}

// Get featured/recommended items
export async function getFeaturedItems(limit = 6) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Return mix of new and highly-rated items
  const featured = MOCK_ITEMS
    .filter(item => item.condition === 'New' || item.condition === 'Like New')
    .slice(0, limit);
    
  return {
    items: featured,
    total: featured.length
  };
}