import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';

export type WishlistItem = {
  id: number;
  name: string;
  price: string;
  category: string;
  image: string;
  originalPrice?: string;
  discount?: string;
  isNew?: boolean;
  isAiTryOn?: boolean;
  isPriceDrop?: boolean;
};

export default function SavedScreen() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, [])
  );

  const loadWishlist = async () => {
    try {
      const existing = await AsyncStorage.getItem('wishlist');
      const items = existing ? JSON.parse(existing) : [];
      console.log('Items loaded:', items.length);
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const handleRemove = (id: number) => {
    console.log('Removing item with id:', id);
    const newList = wishlistItems.filter(item => item.id !== id);
    AsyncStorage.setItem('wishlist', JSON.stringify(newList));
    setWishlistItems(newList);
    console.log('Item removed, new count:', newList.length);
  };

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => (
    <View style={styles.wishlistCard}>
      <Image source={{ uri: item.image }} style={styles.wishlistImage} />
      <View style={styles.wishlistInfo}>
        <View style={styles.wishlistHeader}>
          <Text style={styles.categoryText}>{item.category}</Text>
          <TouchableOpacity onPress={() => handleRemove(item.id)}>
            <Icon name="trash-o" size={18} color="#FF6B8A" />
          </TouchableOpacity>
        </View>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.currentPrice}>{item.price}</Text>
      </View>
    </View>
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
          <Text style={styles.headerTitle}>Saved Items</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* My Wishlist Section */}
        <View style={styles.wishlistHeaderSection}>
          <Text style={styles.wishlistTitle}>My Wishlist</Text>
          <Text style={styles.wishlistCount}>
            {wishlistItems.length} items waiting for you
          </Text>
        </View>

        {/* Wishlist Items Grid */}
        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.wishlistList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="heart-o" size={50} color="#CCC" />
              <Text style={styles.emptyText}>Your wishlist is empty</Text>
              <Text style={styles.emptySubtext}>Tap the heart icon on products to add them here!</Text>
            </View>
          }
        />

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Icon name="bell-o" size={16} color="#FF6B8A" />
          <Text style={styles.footerText}>Always get the best price</Text>
        </View>
        <Text style={styles.footerSubtext}>
          We'll notify you the moment your favorites go on sale!
        </Text>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTab}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('./home')}>
          <Icon name="home" size={22} color="#999" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('./search-result')}>
          <Icon name="search" size={22} color="#999" />
          <Text style={styles.tabText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('./try-on')}>
          <Icon name="camera" size={22} color="#999" />
          <Text style={styles.tabText}>Try-On</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('./saved')}>
          <Icon name="heart" size={22} color="#FF6B8A" />
          <Text style={[styles.tabText, styles.tabActive]}>Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('./profile')}>
          <Icon name="user-o" size={22} color="#999" />
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#2F343A',
  },
  wishlistHeaderSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  wishlistTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2F343A',
    marginBottom: 4,
  },
  wishlistCount: {
    fontSize: 13,
    color: '#888',
  },
  wishlistList: {
    paddingHorizontal: 20,
  },
  wishlistCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wishlistImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  wishlistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  wishlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    color: '#FF6B8A',
    fontWeight: '600',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2F343A',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B8A',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#CCC',
    marginTop: 8,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F343A',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginHorizontal: 40,
    marginBottom: 20,
    lineHeight: 16,
  },
  bottomTab: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabText: {
    fontSize: 10,
    color: '#999',
  },
  tabActive: {
    color: '#FF6B8A',
  },
});