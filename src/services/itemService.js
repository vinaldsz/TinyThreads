// services/itemService.js
import { createItem, getFilterOptions } from "../types/item";

// ===== MOCK DATA =====
const MOCK_ITEMS = [
  createItem({
    id: "1",
    title: "Organic Cotton Onesie - Pink",
    price: 18.99,
    size: "0-3 months",
    condition: "New",
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400",
    description: "Super soft organic cotton onesie in adorable pink. Perfect for newborns with sensitive skin. Machine washable, hypoallergenic fabric. From a smoke-free home.",
    sellerId: "seller1",
    sellerName: "Emma K.",
    category: "Clothing",
    ageRange: "0-3 months",
    location: "Fremont, CA",
    seller: {
      name: "Emma K.",
      email: "emma.k@email.com",
      phone: "(510) 555-0123",
      rating: 4.8,
      joinDate: "2023-06-15"
    },
    status: "available"
  }),

  createItem({
    id: "2",
    title: "Baby Einstein Board Books Set",
    price: 25.0,
    size: "One Size",
    condition: "Like New",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    description: "Set of 4 colorful board books featuring animals, shapes, and first words. Great for developing early reading skills and motor coordination. Pages are thick and durable for little hands.",
    sellerId: "seller2",
    sellerName: "Sarah M.",
    category: "Books",
    ageRange: "6-12 months",
    location: "San Jose, CA",
    seller: {
      name: "Sarah M.",
      email: "sarah.martinez@email.com", 
      phone: "(408) 555-0234",
      rating: 4.9,
      joinDate: "2023-04-22"
    },
    status: "available"
  }),

  createItem({
    id: "3",
    title: "Wooden Stacking Rings Toy",
    price: 15.5,
    size: "One Size",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
    description: "Classic wooden stacking toy with colorful rings. Helps develop hand-eye coordination and problem-solving skills. All rings included, natural wood finish with non-toxic paint.",
    sellerId: "seller3",
    sellerName: "Mike D.",
    category: "Toys",
    ageRange: "6-12 months",
 Updated upstream:src/services/itemService.js
=======
    location: "Palo Alto, CA",
    seller: {
      name: "Mike D.",
      email: "mike.davis@email.com",
      phone: "(650) 555-0345",
      rating: 4.6,
      joinDate: "2023-08-10"
    },
    status: "available"
>>>>>>> Stashed changes:frontend/src/services/itemService.js
  }),

  createItem({
    id: "4",
    title: "Ergonomic Baby Carrier",
    price: 89.99,
    size: "Adjustable",
    condition: "Like New", 
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    description: "Comfortable baby carrier with lumbar support and padded shoulder straps. Multiple carrying positions. Used only a few times before baby preferred the stroller. Includes instruction manual.",
    sellerId: "seller4",
    sellerName: "Jennifer L.",
    category: "Gear",
    ageRange: "0-3 months",
    location: "Mountain View, CA",
    seller: {
      name: "Jennifer L.",
      email: "jennifer.lopez@email.com",
      phone: "(650) 555-0456", 
      rating: 4.7,
      joinDate: "2023-02-18"
    },
    status: "available"
  }),

  createItem({
    id: "5",
    title: "Striped Cotton Romper",
    price: 22.0,
    size: "6-12 months",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400",
    description: "Cute striped romper in blue and white. Perfect for summer outings. 100% cotton, easy snap closures. Shows normal wear but no stains or holes.",
    sellerId: "seller1", 
    sellerName: "Emma K.",
    category: "Clothing",
    ageRange: "6-12 months",
    location: "Fremont, CA",
    seller: {
      name: "Emma K.",
      email: "emma.k@email.com",
      phone: "(510) 555-0123",
      rating: 4.8,
      joinDate: "2023-06-15"
    },
    status: "available"
  }),

  createItem({
    id: "6",
    title: "Soft Plush Teddy Bear",
    price: 12.99,
    size: "Medium",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1551798507-629020c74c8e?w=400",
    description: "Cuddly brown teddy bear, well-loved but clean. Great bedtime companion. Machine washable, hypoallergenic stuffing. Perfect for snuggling and comfort.",
    sellerId: "seller5",
    sellerName: "Amy T.",
    category: "Toys", 
    ageRange: "0-3 months",
    location: "Sunnyvale, CA",
    seller: {
      name: "Amy T.",
      email: "amy.thompson@email.com",
      phone: "(408) 555-0567",
      rating: 4.5,
      joinDate: "2023-07-03"
    },
    status: "available"
  }),

  createItem({
    id: "7",
    title: "Baby's First Words Book",
    price: 8.5,
    size: "One Size",
    condition: "Fair",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    description: "Interactive book with simple words and bright pictures. Some page corners are bent from enthusiastic little readers, but all pages intact and readable.",
    sellerId: "seller2",
    sellerName: "Sarah M.",
    category: "Books",
    ageRange: "12-18 months",
    location: "San Jose, CA",
    seller: {
      name: "Sarah M.",
      email: "sarah.martinez@email.com",
      phone: "(408) 555-0234",
      rating: 4.9,
      joinDate: "2023-04-22"
    },
    status: "available"
  }),

  createItem({
    id: "8",
    title: "High Chair - Convertible",
    price: 125.0,
    size: "Standard",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400",
    description: "Grows with your child! Converts from high chair to toddler chair and booster. Minor scratches on legs but fully functional. Tray and safety straps included.",
    sellerId: "seller6",
    sellerName: "David R.",
    category: "Gear",
    ageRange: "6-12 months",
    location: "Newark, CA",
    seller: {
      name: "David R.",
      email: "david.rodriguez@email.com",
      phone: "(510) 555-0678",
      rating: 4.4,
      joinDate: "2023-05-11"
    },
    status: "available"
  }),

  createItem({
    id: "9",
    title: "Fleece Pajama Set - Dinosaurs",
    price: 16.75,
    size: "18-24 months",
    condition: "Like New",
    imageUrl: "https://images.unsplash.com/photo-1519689373023-dd07c7988bb4?w=400",
    description: "Adorable dinosaur print pajamas in soft fleece. Worn only twice before being outgrown. Perfect for cold nights, flame-resistant fabric.",
    sellerId: "seller7",
    sellerName: "Lisa W.",
    category: "Clothing",
    ageRange: "18-24 months",
    location: "Milpitas, CA",
    seller: {
      name: "Lisa W.",
      email: "lisa.wong@email.com",
      phone: "(408) 555-0789",
      rating: 4.6,
      joinDate: "2023-03-07"
    },
    status: "available"
  }),

  createItem({
    id: "10",
    title: "Musical Activity Gym",
    price: 45.0,
    size: "Large",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
    description: "Colorful play mat with hanging toys and music. Battery compartment works well, includes classical music and nature sounds. Folds flat for storage.",
    sellerId: "seller8",
    sellerName: "Rachel P.",
    category: "Toys",
    ageRange: "0-3 months",
    location: "Union City, CA",
    seller: {
      name: "Rachel P.",
      email: "rachel.patel@email.com",
      phone: "(510) 555-0890",
      rating: 4.8,
      joinDate: "2023-01-25"
    },
    status: "available"
  }),

  createItem({
    id: "11",
    title: "Alphabet Learning Cards",
    price: 11.25,
    size: "One Size",
    condition: "New",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    description: "Brand new flashcards for learning ABCs. Bright colors and fun illustrations. Double-sided cards with letters and corresponding objects. Still in original packaging.",
    sellerId: "seller9",
    sellerName: "Kevin H.",
    category: "Books",
    ageRange: "2-3 years",
    location: "Hayward, CA",
    seller: {
      name: "Kevin H.",
      email: "kevin.harris@email.com",
      phone: "(510) 555-0901",
      rating: 4.3,
      joinDate: "2023-09-12"
    },
    status: "available"
  }),

  createItem({
    id: "12",
    title: "Denim Overall Dress",
    price: 24.5,
    size: "12-18 months",
    condition: "Like New",
    imageUrl: "https://images.unsplash.com/photo-1519689373023-dd07c7988bb4?w=400",
    description: "Trendy denim overall dress with delicate flower embroidery. Perfect condition with adjustable straps. Pairs great with any shirt underneath.",
    sellerId: "seller10",
    sellerName: "Maria S.",
    category: "Clothing", 
    ageRange: "12-18 months",
    location: "San Leandro, CA",
    seller: {
      name: "Maria S.",
      email: "maria.silva@email.com",
      phone: "(510) 555-1012",
      rating: 4.9,
      joinDate: "2023-06-30"
    },
    status: "available"
  }),

  createItem({
    id: "13",
    title: "Stroller - Lightweight",
    price: 175.99,
    size: "Standard",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
    description: "Compact fold stroller, great for travel and public transport. One wheel needs minor adjustment but doesn't affect functionality. Includes cup holder and storage basket.",
    sellerId: "seller4",
    sellerName: "Jennifer L.",
    category: "Gear",
    ageRange: "3-6 months",
    location: "Mountain View, CA",
    seller: {
      name: "Jennifer L.",
      email: "jennifer.lopez@email.com",
      phone: "(650) 555-0456",
      rating: 4.7,
      joinDate: "2023-02-18"
    },
    status: "available"
  }),

  createItem({
    id: "14",
    title: "Shape Sorter Cube",
    price: 19.99,
    size: "Medium",
    condition: "Like New",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
    description: "Educational toy for learning shapes and colors. All 12 pieces included. Helps develop fine motor skills and problem-solving. Durable plastic construction.",
    sellerId: "seller11",
    sellerName: "Tom B.",
    category: "Toys",
    ageRange: "12-18 months",
    location: "Castro Valley, CA",
    seller: {
      name: "Tom B.",
      email: "tom.brown@email.com",
      phone: "(510) 555-1123",
      rating: 4.2,
      joinDate: "2023-08-14"
    },
    status: "available"
  }),

  createItem({
    id: "15",
    title: "Nursery Rhymes Collection",
    price: 14.0,
    size: "One Size",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    description: "Classic nursery rhymes with beautiful watercolor illustrations. Some normal wear on cover but all pages in good condition. Perfect for bedtime reading.",
    sellerId: "seller12",
    sellerName: "Nancy C.",
    category: "Books",
    ageRange: "18-24 months",
    location: "Dublin, CA",
    seller: {
      name: "Nancy C.",
      email: "nancy.chen@email.com",
      phone: "(925) 555-1234",
      rating: 4.7,
      joinDate: "2023-04-05"
    },
    status: "available"
  }),

  createItem({
    id: "16",
    title: "Hooded Towel Set - Animals",
    price: 28.99,
    size: "One Size",
    condition: "New",
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400",
    description: "Set of 3 hooded towels with cute animal faces - lion, elephant, and monkey. Perfect baby shower gift. Super absorbent and soft cotton material. Never used.",
    sellerId: "seller13",
    sellerName: "Carol F.",
    category: "Other",
    ageRange: "0-3 months",
    location: "Pleasanton, CA",
    seller: {
      name: "Carol F.",
      email: "carol.foster@email.com",
      phone: "(925) 555-2345",
      rating: 4.5,
      joinDate: "2023-07-20"
    },
    status: "available"
  }),

  createItem({
    id: "17",
    title: "Cozy Knit Sweater - Yellow",
    price: 32.5,
    size: "2-3 years",
    condition: "Like New",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400",
    description: "Hand-knit yellow sweater with button front closure. Made with love by grandma using soft acrylic yarn. Machine washable, perfect for fall and winter.",
    sellerId: "seller14", 
    sellerName: "Betty M.",
    category: "Clothing",
    ageRange: "2-3 years",
    location: "Livermore, CA",
    seller: {
      name: "Betty M.",
      email: "betty.miller@email.com",
      phone: "(925) 555-3456",
      rating: 4.9,
      joinDate: "2023-01-15"
    },
    status: "available"
  }),

  createItem({
    id: "18",
    title: "Push & Pull Duck Toy",
    price: 21.75,
    size: "Medium",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
    description: "Classic wooden duck on wheels with pull string. Encourages walking and coordination. Natural wood finish with bright yellow paint. String is 18 inches long.",
    sellerId: "seller15",
    sellerName: "Paul G.",
    category: "Toys",
    ageRange: "12-18 months",
    location: "Alameda, CA",
    seller: {
      name: "Paul G.",
      email: "paul.garcia@email.com",
      phone: "(510) 555-4567",
      rating: 4.4,
      joinDate: "2023-05-28"
    },
    status: "available"
  })
];

// ===== SERVICE FUNCTIONS =====

// Get all items (with optional pagination)
export async function getItems(page = 1, limit = 12) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = MOCK_ITEMS.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    total: MOCK_ITEMS.length,
    page: page,
    limit: limit,
    hasMore: endIndex < MOCK_ITEMS.length,
  };
}

// Get single item by ID
export async function getItemById(id) {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const item = MOCK_ITEMS.find((item) => item.id === id);
  if (!item) {
    throw new Error(`Item with id ${id} not found`);
  }
  return item;
}

// Filter items based on criteria
export async function filterItems(filters = {}) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filteredItems = [...MOCK_ITEMS];

  // Filter by category
  if (filters.category && filters.category !== "All") {
    filteredItems = filteredItems.filter(
      (item) => item.category === filters.category
    );
  }

  // Filter by condition
  if (filters.condition && filters.condition !== "All") {
    filteredItems = filteredItems.filter(
      (item) => item.condition === filters.condition
    );
  }

  // Filter by age range
  if (filters.ageRange && filters.ageRange !== "All") {
    filteredItems = filteredItems.filter(
      (item) => item.ageRange === filters.ageRange
    );
  }

  // Filter by price range
  if (filters.minPrice !== undefined) {
    filteredItems = filteredItems.filter(
      (item) => item.price >= filters.minPrice
    );
  }
  if (filters.maxPrice !== undefined) {
    filteredItems = filteredItems.filter(
      (item) => item.price <= filters.maxPrice
    );
  }

  // Search by title or description
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filteredItems = filteredItems.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
    );
  }

  // Sort by price or date
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "price-low":
        filteredItems.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filteredItems.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filteredItems.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "oldest":
        filteredItems.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
    }
  }

  return {
    items: filteredItems,
    total: filteredItems.length,
    appliedFilters: filters,
  };
}

// Search items (simple text search)
export async function searchItems(query) {
  return await filterItems({ searchTerm: query });
}

// Get items by seller
export async function getItemsBySeller(sellerId) {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const sellerItems = MOCK_ITEMS.filter((item) => item.sellerId === sellerId);
  return {
    items: sellerItems,
    total: sellerItems.length,
  };
}

// Get filter options for UI dropdowns
export function getAvailableFilters() {
  return getFilterOptions();
}

// Get featured/recommended items
export async function getFeaturedItems(limit = 6) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Return mix of new and highly-rated items
  const featured = MOCK_ITEMS.filter(
    (item) => item.condition === "New" || item.condition === "Like New"
  ).slice(0, limit);

  return {
    items: featured,
    total: featured.length,
  };
}
