import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';

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
};

export default function HomeScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const recentSearches: RecentSearch[] = ['earrings', 'नेपाली माता', 'silver', 'दर्श'];

  const featuredCollections: FeaturedCollection[] = [
    { id: 1, title: 'Exclusive', subtitle: 'Wedding Special', color: '#FF6B8A' },
    { id: 2, title: 'Trending', subtitle: 'Daily Explore', color: '#FFB347' },
  ];

  const justForYou: Product[] = [
    { id: 1, name: 'Antique Gold Jhumk', price: '₹4,999', tag: 'AI Try-On', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200' },
    { id: 2, name: 'Silver Minimal Ring', price: '₹1,250', tag: 'AI Try-On', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200' },
    { id: 3, name: 'Pearl Drop Necklace', price: '₹3,400', tag: 'AI Try-On', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200' },
    { id: 4, name: 'Floral Tikka', price: '₹2,100', tag: 'AI Try-On', image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=200' },
  ];

  const renderRecentSearch = ({ item }: { item: RecentSearch }) => (
    <TouchableOpacity style={styles.recentChip}>
      <Text style={styles.recentChipText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderJustForYou = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.8}>
      <View style={styles.productImageWrapper}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.aiTag}>
          <Icon name="magic" size={10} color="#FF6B8A" />
          <Text style={styles.aiTagText}>{item.tag}</Text>
        </View>
      </View>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price}</Text>
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
          <Icon name="search" size={18} color="#999" style={styles.searchIcon} />
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
          <View style={styles.sectionHeader}>
            <Icon name="calendar" size={16} color="#FF6B8A" />
            <Text style={styles.sectionTitle}> Recent Searches</Text>
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

      {/* Bottom Tab Bar */}
<View style={styles.bottomTab}>
  <TouchableOpacity style={styles.tabItem} onPress={() => router.push('./home')} activeOpacity={0.7}>
    <Icon name="home" size={22} color="#FF6B8A" />
    <Text style={[styles.tabText, styles.tabActive]}>Home</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.tabItem} onPress={() => router.push('./search-result')} activeOpacity={0.7}>
    <Icon name="search" size={22} color="#999" />
    <Text style={styles.tabText}>Search</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.tabItem} onPress={() => router.push('./try-on')} activeOpacity={0.7}>
    <Icon name="camera" size={22} color="#999" />
    <Text style={styles.tabText}>Try-On</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.tabItem} onPress={() => router.push('./saved')} activeOpacity={0.7}>
    <Icon name="heart-o" size={22} color="#999" />
    <Text style={styles.tabText}>Saved</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.tabItem} onPress={() => router.push('./profile')} activeOpacity={0.7}>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 80,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  welcomeText: {
    fontSize: 14,
    color: '#888',
  },

  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2F343A',
  },

  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 24,
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

  section: {
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2F343A',
  },

  seeAllText: {
    fontSize: 12,
    color: '#FF6B8A',
  },

  recentList: {
    gap: 10,
  },

  recentChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  recentChipText: {
    fontSize: 13,
    color: '#2F343A',
  },

  featuredContainer: {
    flexDirection: 'row',
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
    fontWeight: '700',
    color: '#FFFFFF',
  },

  featuredSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    marginBottom: 12,
  },

  exploreText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  productList: {
    gap: 12,
  },

  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: 160,
    marginRight: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  productImageWrapper: {
    position: 'relative',
    marginBottom: 8,
  },

  productImage: {
    width: '100%',
    height: 130,
    borderRadius: 12,
  },

  aiTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },

  aiTagText: {
    fontSize: 9,
    color: '#FF6B8A',
    fontWeight: '600',
  },

  productName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2F343A',
    marginBottom: 4,
  },

  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B8A',
  },

  bottomTab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },

  tabText: {
    fontSize: 11,
    color: '#999',
  },

  tabActive: {
    color: '#FF6B8A',
  },
});