import React, { useRef } from 'react';
import BottomTab from '../comp/BottomTab';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

export default function TryOnScreen() {
  const router = useRouter();

  const scrollX = useRef(new Animated.Value(0)).current;

  const tryOnResults = [
    {
      id: 1,
      name: 'Traditional Temple Necklace',
      price: '₹12,499',
      image:
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
      isAiGenerated: true,
    },
    {
      id: 2,
      name: 'Silver Nepali Mala',
      price: '₹3,750',
      image:
        'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800',
      isAiGenerated: true,
    },
    {
      id: 3,
      name: 'Antique Gold Jhumka',
      price: '₹5,999',
      image:
        'https://images.unsplash.com/photo-1583391733956-6c1828f99805?w=800',
      isAiGenerated: true,
    },
  ];

  const renderTryOnItem = ({
    item,
    index,
  }: {
    item: typeof tryOnResults[0];
    index: number;
  }) => {

    const inputRange = [
      (index - 1) * width * 0.72,
      index * width * 0.72,
      (index + 1) * width * 0.72,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.88, 1.02, 0.88],
      extrapolate: 'clamp',
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [20, 0, 20],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.resultCard,
          {
            transform: [{ scale }, { translateY }],
            opacity,
          },
        ]}
      >
        <Image source={{ uri: item.image }} style={styles.resultImage} />

        {item.isAiGenerated && (
          <View style={styles.aiTag}>
            <Icon name="magic" size={10} color="#fff" />

            <Text style={styles.aiTagText}>
              AI Generated
            </Text>
          </View>
        )}

        <View style={styles.bottomInfo}>
          <Text style={styles.resultName}>
            {item.name}
          </Text>

          <Text style={styles.resultPrice}>
            {item.price}
          </Text>

          <TouchableOpacity style={styles.buyButton}>
            <Icon
              name="shopping-cart"
              size={14}
              color="#fff"
            />

            <Text style={styles.buyButtonText}>
              Buy Now
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.topRow}>
          <TouchableOpacity>
            <Icon name="chevron-left" size={18} color="#222" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Your Style Try-On
          </Text>

          <View style={styles.tryBadge}>
            <Text style={styles.tryBadgeText}>
              2/3 TRIES
            </Text>
          </View>
        </View>

        {/* MAGIC BADGE */}
        <View style={styles.magicBadge}>
          <Icon name="magic" size={14} color="#FF5C93" />

          <Text style={styles.magicText}>
            AI Magic Ready
          </Text>
        </View>

        {/* TITLE */}
        <Text style={styles.generatedTitle}>
          Generated Results
        </Text>

        <Text style={styles.generatedSubtitle}>
          Swipe to see how these styles look on you.
        </Text>

        {/* ANIMATED CAROUSEL */}
        <Animated.FlatList
          data={tryOnResults}
          renderItem={renderTryOnItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          snapToInterval={width * 0.72}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {
                    x: scrollX,
                  },
                },
              },
            ],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        />

        {/* ANALYTICS */}
        <View style={styles.analyticsRow}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsLabel}>
              TOTAL TRIES TODAY
            </Text>

            <Text style={styles.analyticsValue}>
              12 Generative Fits
            </Text>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsLabel}>
              BEST MATCH
            </Text>

            <Text style={styles.analyticsPink}>
              Traditional
            </Text>
          </View>
        </View>

        {/* UPGRADE */}
        <View style={styles.upgradeBanner}>
          <View>
            <Text style={styles.upgradeTitle}>
              Unlimited styling
            </Text>

            <Text style={styles.upgradeSub}>
              Only ₹99/month
            </Text>
          </View>

          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>
              Upgrade →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BOTTOM TAB */}
      <BottomTab active="try-on" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },

  /* HEADER */

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },

  tryBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  tryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#777',
  },

  /* MAGIC BADGE */

  magicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 22,
  },

  magicText: {
    marginLeft: 8,
    color: '#FF5C93',
    fontWeight: '700',
    fontSize: 13,
  },

  /* TITLES */

  generatedTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#222',
    marginBottom: 8,
  },

  generatedSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },

  /* CAROUSEL */

  carouselContent: {
    paddingLeft: 10,
    paddingRight: 40,
    paddingBottom: 20,
  },

  resultCard: {
    width: width * 0.68,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 18,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 6,
  },

  resultImage: {
    width: '100%',
    height: 340,
    resizeMode: 'cover',
  },

  aiTag: {
    position: 'absolute',
    top: 16,
    left: 16,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FF5C93',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  aiTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },

  bottomInfo: {
    padding: 18,
    backgroundColor: '#fff',
  },

  resultName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
  },

  resultPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FF5C93',
    marginBottom: 16,
  },

  buyButton: {
    height: 48,
    backgroundColor: '#FF5C93',
    borderRadius: 999,

    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  buyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },

  /* ANALYTICS */

  analyticsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },

  analyticsCard: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 22,
    padding: 16,
  },

  analyticsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    marginBottom: 10,
  },

  analyticsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },

  analyticsPink: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF5C93',
  },

  /* UPGRADE */

  upgradeBanner: {
    marginTop: 28,
    backgroundColor: '#FFD9E5',
    borderRadius: 24,
    padding: 20,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  upgradeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },

  upgradeSub: {
    marginTop: 4,
    fontSize: 13,
    color: '#9C4B68',
    fontWeight: '600',
  },

  upgradeBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
  },

  upgradeBtnText: {
    color: '#FF5C93',
    fontWeight: '700',
    fontSize: 14,
  },
});