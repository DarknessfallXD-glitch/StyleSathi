import React, { useRef, useState, useEffect } from 'react';
import BottomTab from '../comp/BottomTab';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../utils/wishlist';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import { 
  searchProducts, 
  getFeaturedItems, 
  filterByCategory, 
  sortProducts,
  SearchProduct,
  FEATURED_ITEMS as STATIC_FEATURED,
  ALL_PRODUCTS as STATIC_PRODUCTS
} from '../services/searchData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

// Filter options
const CATEGORIES = ['All', 'NECKLACE', 'EARRINGS', 'BANGLES', 'BRACELET', 'NATH', 'CHOKER', 'MAANG TIKKA', 'RINGS'];
const SORT_OPTIONS = [
  { id: 'price_asc', label: 'Price: Low to High', icon: 'arrow-up' },
  { id: 'price_desc', label: 'Price: High to Low', icon: 'arrow-down' },
  { id: 'name_asc', label: 'Name: A to Z', icon: 'sort-alpha-asc' },
];

export default function SearchResultsScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wishlistStatus, setWishlistStatus] = useState<{ [key: number]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchProduct[]>([]);
  const [featuredItems, setFeaturedItems] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string | null>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Apply filters whenever search results or filters change
  useEffect(() => {
    applyFilters();
  }, [searchResults, selectedCategory, selectedSort]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load featured items
      const featured = await getFeaturedItems();
      setFeaturedItems(featured);
      
      // Load all products as initial search results
      setSearchResults(STATIC_PRODUCTS);
      setFilteredResults(STATIC_PRODUCTS);
      
      // Check wishlist status
      await checkWishlistStatus(STATIC_PRODUCTS);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to static data
      setFeaturedItems(featuredItems);
      setSearchResults(STATIC_PRODUCTS);
      setFilteredResults(STATIC_PRODUCTS);
      await checkWishlistStatus(STATIC_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    setSearching(true);
    
    try {
      const results = await searchProducts(text);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback: local search in static data
      const fallbackResults = STATIC_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(text.toLowerCase()) ||
        p.category.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(fallbackResults);
    } finally {
      setSearching(false);
    }
  };

  const applyFilters = () => {
    let results = [...searchResults];
    
    // Apply category filter
    if (selectedCategory && selectedCategory !== 'All') {
      results = filterByCategory(results, selectedCategory);
    }
    
    // Apply sorting
    if (selectedSort) {
      results = sortProducts(results, selectedSort);
    }
    
    setFilteredResults(results);
  };

  const checkWishlistStatus = async (products: SearchProduct[]) => {
    const status: { [key: number]: boolean } = {};
    for (const item of products) {
      status[item.id] = await isInWishlist(item.id);
    }
    setWishlistStatus(status);
  };

  const toggleWishlist = async (item: SearchProduct) => {
    const isWishlisted = wishlistStatus[item.id];
    
    if (isWishlisted) {
      await removeFromWishlist(item.id);
      console.log('Removed from wishlist:', item.name);
    } else {
      await addToWishlist({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        image: item.image,
      });
      console.log('Added to wishlist:', item.name);
    }
    
    setWishlistStatus(prev => ({
      ...prev,
      [item.id]: !isWishlisted
    }));
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === 'All' ? null : category);
    setShowCategoryMenu(false);
  };

  const handleSortSelect = (sortId: string) => {
    setSelectedSort(sortId === selectedSort ? null : sortId);
    setShowSortMenu(false);
  };

  const getSortButtonText = () => {
    if (!selectedSort) return 'Sort ▼';
    const option = SORT_OPTIONS.find(o => o.id === selectedSort);
    return option ? `${option.label} ✓` : 'Sort ▼';
  };

  const onScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (width - 40 + 16));
    setCurrentIndex(index);
  };

  const renderFeaturedItem = ({ item }: { item: SearchProduct }) => (
    <TouchableOpacity style={styles.featuredContainer} activeOpacity={0.8}>
      <Image source={{ uri: item.image }} style={styles.featuredImage} />
      <View style={styles.featuredBadge}>
        <Icon name="check-circle" size={14} color="#FF6B8A" />
        <Text style={styles.featuredBadgeText}>AI VERIFIED</Text>
      </View>
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredCategory}>{item.category}</Text>
        <Text style={styles.featuredName}>{item.name}</Text>
        <Text style={styles.featuredPrice}>{item.price}</Text>
        <TouchableOpacity style={styles.buyNowButton}>
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderProductCard = ({ item }: { item: SearchProduct }) => {
    const isWishlisted = wishlistStatus[item.id] || false;
    
    return (
      <View key={item.id} style={{ width: CARD_WIDTH }}>
        <TouchableOpacity style={styles.card} activeOpacity={0.8}>
          <View style={styles.imageContainer}>
  {item.image ? (
    <Image source={{ uri: item.image }} style={styles.cardImage} />
  ) : (
    <View style={[styles.cardImage, styles.noImageContainer]}>
      <Icon name="picture-o" size={35} color="#CCC" />
      <Text style={styles.noImageText}>Image not available</Text>
    </View>
  )}
  
  {item.isNew && (
    <View style={styles.newBadge}>
      <Text style={styles.newBadgeText}>NEW</Text>
    </View>
  )}
            {item.isAiTryOn && (
              <View style={styles.aiBadge}>
                <Icon name="magic" size={8} color="#FFFFFF" />
                <Text style={styles.aiBadgeText}>AI TRY-ON</Text>
              </View>
            )}
            {item.isAiVerified && (
              <View style={styles.aiVerifiedBadge}>
                <Icon name="check-circle" size={8} color="#FFFFFF" />
                <Text style={styles.aiVerifiedBadgeText}>AI VERIFIED</Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.wishlistIcon}
              onPress={() => toggleWishlist(item)}
            >
              <Icon 
                name={isWishlisted ? "heart" : "heart-o"} 
                size={16} 
                color="#FF6B8A" 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardCategory}>{item.category}</Text>
            <Text style={styles.cardName}>{item.name}</Text>
            {item.rating && (
              <View style={styles.ratingContainer}>
                <Icon name="star" size={10} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
            <View style={styles.cardBottom}>
              <Text style={styles.cardPrice}>{item.price}</Text>
              <TouchableOpacity>
                <Text style={styles.detailsText}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B8A" />
        <Text style={styles.loadingText}>Loading products...</Text>
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
          <TouchableOpacity onPress={() => router.replace('./home')}>
            <Icon name="arrow-left" size={22} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Results</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            placeholder="Search for jewelry..."
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searching && <ActivityIndicator size="small" color="#FF6B8A" />}
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="times-circle" size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity 
            style={[styles.filterChip, selectedCategory && styles.activeFilterChip]}
            onPress={() => setShowCategoryMenu(!showCategoryMenu)}
          >
            <Text style={[styles.filterText, selectedCategory && styles.activeFilterText]}>
              {selectedCategory ? `${selectedCategory} ✓` : 'Category ▼'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterChip, selectedSort && styles.activeFilterChip]}
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <Text style={[styles.filterText, selectedSort && styles.activeFilterText]}>
              {getSortButtonText()}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.filterChip}
            onPress={() => {
              setSelectedCategory(null);
              setSelectedSort(null);
              setSearchQuery('');
            }}
          >
            <Text style={styles.filterText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Category Dropdown Menu */}
        {showCategoryMenu && (
          <View style={styles.dropdownMenu}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.dropdownItem,
                    selectedCategory === category && styles.dropdownItemActive
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text style={[
                    styles.dropdownText,
                    selectedCategory === category && styles.dropdownTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Sort Dropdown Menu */}
        {showSortMenu && (
          <View style={styles.dropdownMenu}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.dropdownItem,
                  selectedSort === option.id && styles.dropdownItemActive
                ]}
                onPress={() => handleSortSelect(option.id)}
              >
                <Icon name={option.icon} size={14} color={selectedSort === option.id ? "#FFFFFF" : "#666"} />
                <Text style={[
                  styles.dropdownText,
                  selectedSort === option.id && styles.dropdownTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Results Count */}
        <Text style={styles.resultsTitle}>Showing Results</Text>
        <Text style={styles.resultsCount}>
          Found {filteredResults.length} stunning {filteredResults.length === 1 ? 'piece' : 'pieces'} for you
        </Text>

        {/* Horizontally Scrollable Featured Items */}
        {featuredItems.length > 0 && (
          <View>
            <FlatList
              ref={flatListRef}
              data={featuredItems}
              renderItem={renderFeaturedItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
              snapToInterval={width - 40 + 16}
              decelerationRate="fast"
              onScroll={onScroll}
              scrollEventThrottle={16}
            />
            
            <View style={styles.indicatorContainer}>
              {featuredItems.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicatorDot,
                    currentIndex === index && styles.indicatorDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Search Results Grid */}
        {filteredResults.length > 0 ? (
          <View style={styles.gridContainer}>
            {filteredResults.map((item) => renderProductCard({ item }))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="search" size={50} color="#CCC" />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyText}>
              Try searching for "earrings", "necklace", or "gold"
            </Text>
          </View>
        )}

        {/* End of Results */}
        {filteredResults.length > 0 && (
          <>
            <Text style={styles.endText}>End of Results ▼</Text>
            <Text style={styles.endSubtext}>
              Can't find what you're looking for? Try searching with different keywords.
            </Text>
          </>
        )}
      </ScrollView>

      <BottomTab active="search-result" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2F343A',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 50,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
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
    color: '#333',
    paddingVertical: 12,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  activeFilterChip: {
    backgroundColor: '#FF6B8A',
    borderColor: '#FF6B8A',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  dropdownItemActive: {
    backgroundColor: '#FF6B8A',
  },
  dropdownText: {
    fontSize: 13,
    color: '#666',
  },
  dropdownTextActive: {
    color: '#FFFFFF',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2F343A',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  resultsCount: {
    fontSize: 13,
    color: '#888',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  featuredList: {
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 16,
  },
  featuredContainer: {
    width: width - 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
  },
  featuredImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 6,
  },
  featuredBadgeText: {
    color: '#FF6B8A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  featuredInfo: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  featuredCategory: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: 4,
  },
  featuredName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F343A',
    marginBottom: 6,
  },
  featuredPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B8A',
    marginBottom: 12,
  },
  buyNowButton: {
    backgroundColor: '#FF6B8A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  buyNowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DDD',
    marginHorizontal: 4,
  },
  indicatorDotActive: {
    width: 20,
    backgroundColor: '#FF6B8A',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6B8A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  aiBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
  },
  aiVerifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  aiVerifiedBadgeText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '600',
  },
  wishlistIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cardInfo: {
    padding: 12,
  },
  cardCategory: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2F343A',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 11,
    color: '#888',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B8A',
  },
  detailsText: {
    fontSize: 12,
    color: '#FF6B8A',
    fontWeight: '600',
  },
  endText: {
    fontSize: 13,
    color: '#FF6B8A',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  endSubtext: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginHorizontal: 40,
    marginBottom: 20,
    lineHeight: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    marginHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 8,
    textAlign: 'center',
  },
  noImageContainer: {
  backgroundColor: '#F5F5F5',
  justifyContent: 'center',
  alignItems: 'center',
},
noImageText: {
  fontSize: 12,
  color: '#999',
  marginTop: 8,
},
});