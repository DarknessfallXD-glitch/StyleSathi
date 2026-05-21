import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../Context/ThemeContext';
import { ThemedText } from '../comp/ThemedText';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams();

  const product = params.product ? JSON.parse(params.product as string) : null;

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText>Product not found</ThemedText>
      </View>
    );
  }

  const badges = ['Festival Special', 'On You']; // Static or could come from product

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Icon name="arrow-left" size={22} color={colors.text} />
      </TouchableOpacity>

      {/* Product Image */}
      <Image source={{ uri: product.image }} style={styles.productImage} />

      {/* Badges */}
      <View style={styles.badgesRow}>
        {badges.map((badge, index) => (
          <View key={index} style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ))}
      </View>

      {/* Title & Rating */}
      <ThemedText style={styles.productName}>{product.name}</ThemedText>
      <View style={styles.ratingRow}>
        <Icon name="star" size={16} color="#FFD700" />
        <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
          {product.rating} ({product.reviewCount} Reviews)
        </Text>
      </View>

      {/* Price */}
      <ThemedText style={[styles.price, { color: colors.primary }]}>
        {product.price}
      </ThemedText>

      {/* About Section */}
      <ThemedText style={styles.sectionTitle}>ABOUT THIS ITEM</ThemedText>
      <ThemedText type="secondary" style={styles.description}>
        {product.description}
      </ThemedText>

      {/* Specifications */}
      <ThemedText style={styles.sectionTitle}>SPECIFICATIONS</ThemedText>
      <View style={styles.specsContainer}>
        <ThemedText style={styles.specItem}>• Material: {product.material}</ThemedText>
        <ThemedText style={styles.specItem}>• Weight: {product.weight}</ThemedText>
        <ThemedText style={styles.specItem}>• Length: {product.length}</ThemedText>
        <ThemedText style={styles.specItem}>• Gemstones: {product.gemstones}</ThemedText>
      </View>

      {/* Features / Benefits */}
      <View style={styles.featuresRow}>
        {product.features?.map((feature, idx) => (
          <View key={idx} style={styles.featureItem}>
            <Icon name={feature.icon} size={20} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>{feature.text}</Text>
          </View>
        ))}
      </View>

      {/* Retailers */}
      <ThemedText style={styles.sectionTitle}>SELECT RETAILER TO BUY</ThemedText>
      {product.retailers?.map((retailer, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.retailerCard, { backgroundColor: colors.surface }]}
          onPress={() => Alert.alert('Redirect', `You will be redirected to ${retailer.name}`)}
        >
          <Text style={[styles.retailerName, { color: colors.text }]}>{retailer.name}</Text>
          <Text style={[styles.retailerPrice, { color: colors.primary }]}>{retailer.price}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: width,
    height: width * 0.9,
    resizeMode: 'cover',
    marginBottom: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  specsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  specItem: {
    fontSize: 14,
    marginBottom: 6,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  featureItem: {
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
  },
  retailerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  retailerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  retailerPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
});