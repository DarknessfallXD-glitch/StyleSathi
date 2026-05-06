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
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

export default function SearchResultsScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wishlistStatus, setWishlistStatus] = useState<{ [key: number]: boolean }>({});

  const featuredItems = [
    {
      id: 1,
      name: 'Traditional Temple Necklace',
      price: '₹12,499',
      category: 'NECKLACE',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
      isAiVerified: true,
    },
    {
      id: 2,
      name: 'Antique Gold Jhumka',
      price: '₹8,999',
      category: 'EARRINGS',
      image: 'https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=400',
      isAiVerified: true,
    },
    {
      id: 3,
      name: 'Diamond Pendant Set',
      price: '₹24,999',
      category: 'NECKLACE',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
      isAiVerified: true,
    },
    {
      id: 4,
      name: 'Kundan Matha Patti',
      price: '₹15,999',
      category: 'MAANG TIKKA',
      image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400',
      isAiVerified: true,
    },
  ];

  const searchResults = [
    { id: 1, name: 'Silver Nepali Mala', price: '₹3,750', category: 'NECKLACE', image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=200', isNew: true, isAiTryOn: true },
    { id: 2, name: 'Rose Gold Bangle', price: '₹1,499', category: 'BANGLES', image: 'https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=200' },
    { id: 3, name: 'White Gold Bracelet', price: '₹1,699', category: 'BRACELET', image: 'https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=200' },
    { id: 4, name: 'Floral Nathi', price: '₹1,200', category: 'NATH', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200' },
    { id: 5, name: 'White Choker', price: '₹500', category: 'CHOKER', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200' },
    { id: 6, name: 'Gold Temple Jhumka', price: '₹5,999', category: 'EARRINGS', image: 'https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=200', isNew: true },
  ];

  // Check wishlist status when component loads
  useEffect(() => {
    checkWishlistStatus();
  }, []);

  const checkWishlistStatus = async () => {
    const status: { [key: number]: boolean } = {};
    for (const item of searchResults) {
      status[item.id] = await isInWishlist(item.id);
    }
    setWishlistStatus(status);
  };

  const toggleWishlist = async (item: typeof searchResults[0]) => {
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
    
    // Update the status for this item
    setWishlistStatus(prev => ({
      ...prev,
      [item.id]: !isWishlisted
    }));
  };

  const onScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (width - 40 + 16));
    setCurrentIndex(index);
  };

  const renderFeaturedItem = ({ item }: { item: typeof featuredItems[0] }) => (
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

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-left" size={22} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Results</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>Category ▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>Price ▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>Sort ▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>Me</Text>
          </TouchableOpacity>
        </View>

        {/* Results Count */}
        <Text style={styles.resultsTitle}>Showing Results</Text>
        <Text style={styles.resultsCount}>Found 128 stunning pieces for you</Text>

        {/* Horizontally Scrollable Featured Items */}
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
          
          <View style={styles.scrollHint}>
            <Icon name="arrow-left" size={12} color="#999" />
            <Text style={styles.scrollHintText}>Scroll to see more</Text>
            <Icon name="arrow-right" size={12} color="#999" />
          </View>
        </View>

        {/* Two Cards Per Row Grid */}
        <View style={styles.gridContainer}>
          {searchResults.map((item) => {
            const isWishlisted = wishlistStatus[item.id] || false;
            
            return (
              <View key={item.id} style={{ width: CARD_WIDTH }}>
                <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: item.image }} style={styles.cardImage} />
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
                    {/* Heart Icon - Toggles between outline and filled */}
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
          })}
        </View>

        {/* End of Results */}
        <Text style={styles.endText}>End of Results ▼</Text>
        <Text style={styles.endSubtext}>
          Can't find what you're looking for? Try accessing it in the AI Search on Home.
        </Text>
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

  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },

  wishlistIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  filterText: {
    fontSize: 12,
    color: '#666',
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
    marginBottom: 8,
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

  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },

  scrollHintText: {
    fontSize: 11,
    color: '#999',
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
    marginBottom: 8,
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

});