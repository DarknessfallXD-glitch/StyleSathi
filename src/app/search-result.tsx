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
import { useTheme } from '../Context/ThemeContext';
import { ThemedText } from '../comp/ThemedText';
import { 
  searchProducts, 
  filterByCategory, 
  sortProducts,
  SearchProduct,
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
  const { colors, isDarkMode } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wishlistStatus, setWishlistStatus] = useState<{ [key: number]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchProduct[]>([]);
  const [topResults, setTopResults] = useState<SearchProduct[]>([]);
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
      setSearchResults(STATIC_PRODUCTS);
      setFilteredResults(STATIC_PRODUCTS);
      const top4 = [...STATIC_PRODUCTS]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4);
      setTopResults(top4);
      await checkWishlistStatus(STATIC_PRODUCTS);
    } catch (error) {
      console.error('Error loading data:', error);
      setSearchResults(STATIC_PRODUCTS);
      setFilteredResults(STATIC_PRODUCTS);
      const top4 = [...STATIC_PRODUCTS]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4);
      setTopResults(top4);
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
      const top4 = [...results]
        .sort((a, b) => {
          const aNameMatch = a.name.toLowerCase().includes(text.toLowerCase()) ? 1 : 0;
          const bNameMatch = b.name.toLowerCase().includes(text.toLowerCase()) ? 1 : 0;
          if (aNameMatch !== bNameMatch) return bNameMatch - aNameMatch;
          return (b.rating || 0) - (a.rating || 0);
        })
        .slice(0, 4);
      setTopResults(top4);
    } catch (error) {
      console.error('Search error:', error);
      const fallbackResults = STATIC_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(text.toLowerCase()) ||
        p.category.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(fallbackResults);
      const top4 = [...fallbackResults].slice(0, 4);
      setTopResults(top4);
    } finally {
      setSearching(false);
    }
  };

  const applyFilters = () => {
    let results = [...searchResults];
    if (selectedCategory && selectedCategory !== 'All') {
      results = filterByCategory(results, selectedCategory);
    }
    if (selectedSort) {
      results = sortProducts(results, selectedSort);
    }
    setFilteredResults(results);
    const top4 = [...results].slice(0, 4);
    setTopResults(top4);
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
    } else {
      await addToWishlist({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        image: item.image,
      });
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

const renderFeaturedItem = ({ item }) => (
  <TouchableOpacity
    style={styles.featuredContainer}
    onPress={() => {
      router.push({
        pathname: '/product-detail',
        params: { product: JSON.stringify(item) },
      });
    }}
  >
      <Image source={{ uri: item.image }} style={styles.featuredImage} />
      <View style={styles.featuredBadge}>
        <Icon name="check-circle" size={14} color={colors.primary} />
        <Text style={styles.featuredBadgeText}>TOP PICK</Text>
      </View>
      <View style={styles.featuredInfo}>
        <Text style={[styles.featuredCategory, { color: colors.textSecondary }]}>{item.category}</Text>
        <Text style={[styles.featuredName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.featuredPrice, { color: colors.primary }]}>{item.price}</Text>
        {item.rating && (
          <View style={styles.featuredRating}>
            <Icon name="star" size={12} color="#FFD700" />
            <Text style={[styles.featuredRatingText, { color: colors.textSecondary }]}>{item.rating}</Text>
          </View>
        )}
        <TouchableOpacity style={[styles.buyNowButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.buyNowText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

    const renderProductCard = (item: SearchProduct) => {
      const isWishlisted = wishlistStatus[item.id] || false;
      
      return (
        
        <View key={item.id} style={{ width: CARD_WIDTH }}>
          
          <TouchableOpacity
  style={[styles.card, { backgroundColor: colors.surface }]}
  activeOpacity={0.8}
  onPress={() => {
    router.push({
      pathname: '/product-detail',
      params: { product: JSON.stringify(item) },
    });
  }}
>
            <View style={styles.imageContainer}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImage, styles.noImageContainer, { backgroundColor: colors.inputBackground }]}>
                  <Icon name="picture-o" size={35} color={colors.textSecondary} />
                  <Text style={[styles.noImageText, { color: colors.textSecondary }]}>No Image</Text>
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
                style={[styles.wishlistIcon, { backgroundColor: colors.surface }]}
                onPress={() => toggleWishlist(item)}
              >
                <Icon 
                  name={isWishlisted ? "heart" : "heart-o"} 
                  size={16} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardCategory, { color: colors.textSecondary }]}>{item.category}</Text>
            <Text style={[styles.cardName, { color: colors.text }]}>{item.name}</Text>
            {item.rating && (
              <View style={styles.ratingContainer}>
                <Icon name="star" size={10} color="#FFD700" />
                <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{item.rating}</Text>
              </View>
            )}
            <View style={styles.cardBottom}>
              <Text style={[styles.cardPrice, { color: colors.primary }]}>{item.price}</Text>
              <TouchableOpacity>
                <Text style={[styles.detailsText, { color: colors.primary }]}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('./home')}>
            <Icon name="arrow-left" size={22} color={colors.icon} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Search Results</ThemedText>
          <View style={{ width: 22 }} />
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Icon name="search" size={18} color={colors.placeholder} style={styles.searchIcon} />
          <TextInput
            placeholder="Search for jewelry..."
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, { color: colors.inputText }]}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searching && <ActivityIndicator size="small" color={colors.primary} />}
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="times-circle" size={16} color={colors.placeholder} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity 
            style={[styles.filterChip, { backgroundColor: colors.surface, borderColor: colors.border }, selectedCategory && styles.activeFilterChip]}
            onPress={() => setShowCategoryMenu(!showCategoryMenu)}
          >
            <Text style={[styles.filterText, { color: selectedCategory ? "#FFF" : colors.textSecondary }, selectedCategory && styles.activeFilterText]}>
              {selectedCategory ? `${selectedCategory} ✓` : 'Category ▼'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterChip, { backgroundColor: colors.surface, borderColor: colors.border }, selectedSort && styles.activeFilterChip]}
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <Text style={[styles.filterText, { color: selectedSort ? "#FFF" : colors.textSecondary }, selectedSort && styles.activeFilterText]}>
              {getSortButtonText()}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => {
              setSelectedCategory(null);
              setSelectedSort(null);
              setSearchQuery('');
            }}
          >
            <Text style={[styles.filterText, { color: colors.textSecondary }]}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Category Dropdown Menu */}
        {showCategoryMenu && (
          <View style={[styles.dropdownMenu, { backgroundColor: colors.surface }]}>
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
                    { color: selectedCategory === category ? "#FFF" : colors.text },
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
          <View style={[styles.dropdownMenu, { backgroundColor: colors.surface }]}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.dropdownItem,
                  selectedSort === option.id && styles.dropdownItemActive
                ]}
                onPress={() => handleSortSelect(option.id)}
              >
                <Icon name={option.icon} size={14} color={selectedSort === option.id ? "#FFF" : colors.icon} />
                <Text style={[
                  styles.dropdownText,
                  { color: selectedSort === option.id ? "#FFF" : colors.text },
                  selectedSort === option.id && styles.dropdownTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Results Count */}
        <ThemedText style={styles.resultsTitle}>Showing Results</ThemedText>
        <ThemedText type="secondary" style={styles.resultsCount}>
          Found {filteredResults.length} stunning {filteredResults.length === 1 ? 'piece' : 'pieces'} for you
        </ThemedText>

        {/* TOP RESULTS */}
        {topResults.length > 0 && (
          <View>
            <View style={styles.topResultsHeader}>
              <Icon name="trophy" size={16} color={colors.primary} />
              <Text style={[styles.topResultsTitle, { color: colors.primary }]}>Top Results</Text>
            </View>
            <FlatList
              ref={flatListRef}
              data={topResults}
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
              {topResults.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicatorDot,
                    { backgroundColor: colors.textSecondary },
                    currentIndex === index && styles.indicatorDotActive
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Search Results Grid */}
        {filteredResults.length > 0 ? (
          <>
            <View style={styles.allResultsHeader}>
              <Icon name="list" size={14} color={colors.textSecondary} />
              <Text style={[styles.allResultsTitle, { color: colors.textSecondary }]}>All Results ({filteredResults.length})</Text>
            </View>
            <View style={styles.gridContainer}>
              {filteredResults.map((item) => renderProductCard(item))}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="search" size={50} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Try searching for "earrings", "necklace", or "gold"
            </Text>
          </View>
        )}

        {/* End of Results */}
        {filteredResults.length > 0 && (
          <>
            <Text style={[styles.endText, { color: colors.primary }]}>End of Results ▼</Text>
            <Text style={[styles.endSubtext, { color: colors.textSecondary }]}>
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: 18,
    borderWidth: 1,
  },
  activeFilterChip: {
    backgroundColor: '#FF6B8A',
    borderColor: '#FF6B8A',
  },
  filterText: {
    fontSize: 12,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  dropdownMenu: {
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
  },
  dropdownTextActive: {
    color: '#FFFFFF',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  resultsCount: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  topResultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  topResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  allResultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
    gap: 8,
  },
  allResultsTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  featuredList: {
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 16,
  },
  featuredContainer: {
    width: width - 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredImage: {
    width: '100%',
    height: 250,
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
    color: 'grey',
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
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: 4,
  },
  featuredName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  featuredPrice: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  featuredRatingText: {
    fontSize: 13,
  },
  buyNowButton: {
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
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '600',
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
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  detailsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  endText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  endSubtext: {
    fontSize: 11,
    textAlign: 'center',
    marginHorizontal: 40,
    marginBottom: 20,
    lineHeight: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
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
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 12,
    marginTop: 8,
  },
});