// ==================== DUMMY DATA SERVICE ====================
// This file contains dummy data for testing
// Replace with real API calls when backend is ready

export type Product = {
  id: number;
  name: string;
  price: string;
  tag: string;
  image: string;
  category: string;
};

export type FeaturedCollection = {
  id: number;
  title: string;
  subtitle: string;
  color: string;
};

export type RecentSearch = string;

// Dummy products data
export const DUMMY_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Antique Gold Jhumk",
    price: "₹4,999",
    tag: "AI Try-On",
    category: "EARRINGS",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200",
  },
  {
    id: 2,
    name: "Silver Minimal Ring",
    price: "₹1,250",
    tag: "AI Try-On",
    category: "RINGS",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200",
  },
  {
    id: 3,
    name: "Pearl Drop Necklace",
    price: "₹3,400",
    tag: "AI Try-On",
    category: "NECKLACE",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200",
  },
  {
    id: 4,
    name: "Floral Tikka",
    price: "₹2,100",
    tag: "AI Try-On",
    category: "MAANG TIKKA",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=200",
  },
  {
    id: 5,
    name: "Traditional Temple Necklace",
    price: "₹12,499",
    tag: "Best Seller",
    category: "NECKLACE",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200",
  },
  {
    id: 6,
    name: "Rose Gold Bangle",
    price: "₹1,499",
    tag: "Trending",
    category: "BANGLES",
    image: "https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=200",
  },
];

// Dummy featured collections
export const DUMMY_FEATURED: FeaturedCollection[] = [
  { id: 1, title: "Exclusive", subtitle: "Wedding Special", color: "#FF6B8A" },
  { id: 2, title: "Trending", subtitle: "Daily Explore", color: "#FFB347" },
  { id: 3, title: "New Arrivals", subtitle: "Just Landed", color: "#6C5CE7" },
];

// Dummy recent searches
export const DUMMY_RECENT_SEARCHES: RecentSearch[] = [
  "earrings",
  "नेपाली माता",
  "silver",
  "gold necklace",
  "diamond ring",
];

// API Service (switch between dummy and real API)
const USE_REAL_API = false; // Change to true when backend is ready
const API_BASE_URL = "http://localhost:3000/api";

// Fetch Just For You products
export const fetchJustForYou = async (): Promise<Product[]> => {
  if (!USE_REAL_API) {
    // Return dummy data
    return DUMMY_PRODUCTS;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/products/just-for-you`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

// Fetch Featured Collections
export const fetchFeaturedCollections = async (): Promise<FeaturedCollection[]> => {
  if (!USE_REAL_API) {
    return DUMMY_FEATURED;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/home/featured`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

// Fetch Recent Searches
export const fetchRecentSearches = async (): Promise<RecentSearch[]> => {
  if (!USE_REAL_API) {
    return DUMMY_RECENT_SEARCHES;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/recent-searches`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};