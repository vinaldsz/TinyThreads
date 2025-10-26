// services/itemService.js
import { getFilterOptions } from "../types/item";

// ===== SERVICE FUNCTIONS =====

// Base URL (works for Next.js App Router API routes). If you have a separate backend,
// set NEXT_PUBLIC_API_BASE_URL to something like "https://api.tinythreads.app".
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

// Normalize DB shape → UI shape expected by ItemGrid
function normalizeItem(i) {
  if (!i) return i;
  const rawId = i._id ?? i.id;
  const idStr = typeof rawId === 'string' ? rawId : (rawId ? String(rawId) : undefined);

  return {
    id: idStr,
    _id: idStr,
    title: i.title ?? '',
    price: typeof i.price === 'number' ? i.price : Number(i.price ?? 0),
    size: i.size ?? '',
    condition: i.condition ?? '',
    imageUrl: Array.isArray(i.imageUrls) && i.imageUrls.length
      ? i.imageUrls[0]
      : (i.imageUrl ?? null),
    description: i.description ?? '',
    category: i.category ?? '',
    ageRange: i.ageRange ?? '',
    location: i.location ?? '',
    status: i.status ?? 'available',
    // --- Commented out for current sprint ---
    // sellerId: i.sellerId ?? '',
    // sellerName: i.sellerName ?? '',
    // createdAt: i.createdAt ?? null,
    // Any seller or timestamp fields are ignored for now
  };
}

// Get all items (with optional pagination)
export async function getItems(page = 1, limit = 12, extra = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  Object.entries(extra).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  });
  const data = await apiFetch(`/api/items?${params.toString()}`);
  const items = Array.isArray(data.items) ? data.items.map(normalizeItem) : [];
  return {
    items,
    total: Number(data.total ?? items.length),
    page: Number(data.page ?? page),
    limit: Number(data.limit ?? limit),
    hasMore: Boolean(data.hasMore ?? (items.length === limit)),
  };
}

// Get single item by ID
export async function getItemById(id) {
  if (!id) throw new Error("Missing item id");
  const data = await apiFetch(`/api/items/${id}`);
  // Allow either { item } or direct object
  const item = data.item || data;
  if (!item) throw new Error(`Item with id ${id} not found`);
  return normalizeItem(item);
}

// Filter items based on criteria
export async function filterItems(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "" && v !== "All") params.set(k, String(v));
  });
  const data = await apiFetch(`/api/items?${params.toString()}`);
  const items = Array.isArray(data.items) ? data.items.map(normalizeItem) : [];
  return {
    items,
    total: Number(data.total ?? items.length),
    appliedFilters: filters,
  };
}

// Search items (simple text search)
export async function searchItems(query) {
  return await filterItems({ searchTerm: query });
}

// Get items by seller
export async function getItemsBySeller(sellerId, page = 1, limit = 24) {
  if (!sellerId) throw new Error("Missing sellerId");
  const params = new URLSearchParams({ sellerId, page: String(page), limit: String(limit) });
  const data = await apiFetch(`/api/items?${params.toString()}`);
  const items = Array.isArray(data.items) ? data.items.map(normalizeItem) : [];
  return {
    items,
    total: Number(data.total ?? items.length),
  };
}

// Get filter options for UI dropdowns (static list for now; can be switched to API later)
export function getAvailableFilters() {
  return getFilterOptions();
}

// Get featured/recommended items
export async function getFeaturedItems(limit = 6) {
  const params = new URLSearchParams({ limit: String(limit), featured: "true" });
  const data = await apiFetch(`/api/items?${params.toString()}`);
  const items = Array.isArray(data.items) ? data.items.map(normalizeItem) : [];
  return {
    items,
    total: Number(data.total ?? items.length),
  };
}
