import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import BottomTab from "../comp/BottomTab";

import {
  addToWishlist,
  isInWishlist,
  removeFromWishlist,
} from "../utils/wishlist";

// Import from dummy data service
import {
  FeaturedCollection,
  fetchFeaturedCollections,
  fetchJustForYou,
  fetchRecentSearches,
  Product,
  RecentSearch,
} from "../services/dummyData";

// ==================== EMPTY STATE COMPONENTS ====================
const EmptyProducts = () => (
  <View style={styles.emptyContainer}>
    <Icon name="shopping-bag" size={60} color="#CCC" />
    <Text style={styles.emptyTitle}>No products found</Text>
    <Text style={styles.emptyText}>Check back later for new jewelry!</Text>
  </View>
);

const EmptyFeatured = () => (
  <View style={styles.emptyFeaturedContainer}>
    <Icon name="star" size={30} color="#CCC" />
    <Text style={styles.emptyFeaturedText}>No featured collections</Text>
  </View>
);

const EmptyRecent = () => (
  <View style={styles.emptyRecentContainer}>
    <Icon name="history" size={24} color="#CCC" />
    <Text style={styles.emptyRecentText}>No recent searches</Text>
  </View>
);

// ==================== COMPONENT ====================
export default function HomeScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [justForYou, setJustForYou] = useState<Product[]>([]);
  const [featuredCollections, setFeaturedCollections] = useState<
    FeaturedCollection[]
  >([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [wishlistStatus, setWishlistStatus] = useState<{
    [key: number]: boolean;
  }>({});

  // Load all data when component mounts
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [products, featured, searches] = await Promise.all([
        fetchJustForYou(),
        fetchFeaturedCollections(),
        fetchRecentSearches(),
      ]);

      setJustForYou(products);
      setFeaturedCollections(featured);
      setRecentSearches(searches);

      if (products && products.length > 0) {
        await checkWishlistStatus(products);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
  };

  const checkWishlistStatus = async (products: Product[]) => {
    const status: { [key: number]: boolean } = {};
    for (const item of products) {
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

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B8A"]}
          />
        }
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

        {/* Recent Searches Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="calendar" size={16} color="#FF6B8A" />
            <Text style={styles.sectionTitle}> Recent Searches</Text>
          </View>
          {recentSearches.length > 0 ? (
            <FlatList
              data={recentSearches}
              renderItem={renderRecentSearch}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            />
          ) : (
            <EmptyRecent />
          )}
        </View>

        {/* Featured Collections Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Collections</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {featuredCollections.length > 0 ? (
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
          ) : (
            <EmptyFeatured />
          )}
        </View>

        {/* Just For You Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Just For You</Text>
          </View>
          {justForYou.length > 0 ? (
            <FlatList
              data={justForYou}
              renderItem={renderJustForYou}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}
            />
          ) : (
            <EmptyProducts />
          )}
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
    padding: 20,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#888",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    marginTop: 8,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
    marginTop: 12,
  },

  emptyText: {
    fontSize: 12,
    color: "#BBB",
    marginTop: 4,
  },

  emptyFeaturedContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
  },

  emptyFeaturedText: {
    fontSize: 12,
    color: "#BBB",
    marginTop: 8,
  },

  emptyRecentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 20,
    gap: 8,
  },

  emptyRecentText: {
    fontSize: 12,
    color: "#BBB",
  },
});