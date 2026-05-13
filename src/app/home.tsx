import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";    
import Icon from "react-native-vector-icons/FontAwesome";
import BottomTab from "../comp/BottomTab.tsx";

import {
  addToWishlist,
  isInWishlist,
  removeFromWishlist,
} from "../utils/wishlist";

import { fetchJustForYou } from "../services/api.ts";

// Add type definitions
type RecentSearch = string;

type FeaturedCollection = {
  id: number;
  title: string;
  subtitle: string;
  color: string;
};

type Product = {
  id: number;
  name: string;
  price: string;
  tag: string;
  image: string;
  category: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [wishlistStatus, setWishlistStatus] = useState<{
    [key: number]: boolean;
  }>({});
  const [justForYou, setJustForYou] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recentSearches: RecentSearch[] = [
    "earrings",
    "नेपाली माता",
    "silver",
    "दर्श",
  ];

  const featuredCollections: FeaturedCollection[] = [
    {
      id: 1,
      title: "Exclusive",
      subtitle: "Wedding Special",
      color: "#FF6B8A",
    },
    { id: 2, title: "Trending", subtitle: "Daily Explore", color: "#FFB347" },
  ];

  // Fetch products from API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchJustForYou();

      if (result.success) {
        // Transform API data to match Product type
        const products = result.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: `₹${item.price.toLocaleString()}`,
          tag: item.tag || "AI Try-On",
          category: item.category,
          image: item.image_url,
        }));
        setJustForYou(products);
      } else {
        setError(result.error || "Failed to load products");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Check wishlist status when component loads
  useEffect(() => {
    checkWishlistStatus();
  }, [justForYou]);

  const checkWishlistStatus = async () => {
    const status: { [key: number]: boolean } = {};
    for (const item of justForYou) {
      status[item.id] = await isInWishlist(item.id);
    }
    setWishlistStatus(status);
  };

  const toggleWishlist = async (item: Product) => {
    const isWishlisted = wishlistStatus[item.id];

    if (isWishlisted) {
      await removeFromWishlist(item.id);
      console.log("Removed from wishlist:", item.name);
    } else {
      await addToWishlist({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        image: item.image,
      });
      console.log("Added to wishlist:", item.name);
    }

    setWishlistStatus((prev) => ({
      ...prev,
      [item.id]: !isWishlisted,
    }));
  };

  const renderRecentSearch = ({ item }: { item: RecentSearch }) => (
    <TouchableOpacity style={styles.recentChip}>
      <Text style={styles.recentChipText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderJustForYou = ({ item }: { item: Product }) => {
    const isWishlisted = wishlistStatus[item.id] || false;

    return (
      <TouchableOpacity style={styles.productCard} activeOpacity={0.8}>
        <View style={styles.productImageWrapper}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
          <View style={styles.aiTag}>
            <Icon name="magic" size={10} color="#FF6B8A" />
            <Text style={styles.aiTagText}>{item.tag}</Text>
          </View>
          <TouchableOpacity
            style={styles.wishlistIcon}
            onPress={() => toggleWishlist(item)}
          >
            <Icon
              name={isWishlisted ? "heart" : "heart-o"}
              size={18}
              color="#FF6B8A"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B8A" />
        <Text style={styles.loadingText}>Loading amazing jewelry...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="exclamation-triangle" size={50} color="#FF6B8A" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.userName}>Hi, Sneha! 😊</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Icon name="user-circle-o" size={32} color="#FF6B8A" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={18}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Describe what you want..."
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
          <Icon name="microphone" size={18} color="#FF6B8A" />
        </View>

        {/* Recent Searches */}
        <View style={styles.section}>
          <View style={styles.RecentSearches}>
            <Icon name="calendar" size={16} color="#FF6B8A" />
            <Text style={styles.RecentTitle}> Recent Searches</Text>
          </View>
          <FlatList
            data={recentSearches}
            renderItem={renderRecentSearch}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentList}
          />
        </View>

        {/* Featured Collections */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Collections</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuredContainer}>
            {featuredCollections.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.featuredCard, { backgroundColor: item.color }]}
                activeOpacity={0.8}
              >
                <Text style={styles.featuredTitle}>{item.title}</Text>
                <Text style={styles.featuredSubtitle}>{item.subtitle}</Text>
                <Text style={styles.exploreText}>Explore Items →</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Just For You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Just For You</Text>
          </View>
          <FlatList
            data={justForYou}
            renderItem={renderJustForYou}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>
      </ScrollView>

      <BottomTab active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 80,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  welcomeText: {
    fontSize: 14,
    color: "#888",
  },

  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2F343A",
  },

  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF0F2",
    justifyContent: "center",
    alignItems: "center",
  },

  wishlistIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  RecentSearches:{
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginRight:100,
    height:40,
  },
  RecentTitle:{
    fontSize: 20,
    fontWeight: "600",
    color: "#2F343A",
  }
  ,

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    paddingVertical: 12,
  },

  section: {
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2F343A",
  },

  seeAllText: {
    fontSize: 12,
    color: "#FF6B8A",
  },

  recentList: {
    gap: 10,
  },

  recentChip: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  recentChipText: {
    fontSize: 13,
    color: "#2F343A",
  },

  featuredContainer: {
    flexDirection: "row",
    gap: 12,
  },

  featuredCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    height: 120,
  },

  featuredTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  featuredSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
    marginBottom: 12,
  },

  exploreText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  productList: {
    gap: 12,
  },

  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: 160,
    marginRight: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  productImageWrapper: {
    position: "relative",
    marginBottom: 8,
  },

  productImage: {
    width: "100%",
    height: 130,
    borderRadius: 12,
  },

  aiTag: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },

  aiTagText: {
    fontSize: 9,
    color: "#FF6B8A",
    fontWeight: "600",
  },

  productName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#2F343A",
    marginBottom: 4,
  },

  productPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF6B8A",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F4F4",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#888",
  },

  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#FF4444",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  retryButton: {
    marginTop: 16,
    backgroundColor: "#FF6B8A",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
