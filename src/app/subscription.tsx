import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getLocalSubscription, 
  updateLocalSubscription,
  SubscriptionStatus,
  SubscriptionPlan,
  getFeaturesForPlan,
  sendSubscriptionToBackend
} from '../utils/subscription';

export default function SubscriptionScreen() {
  const router = useRouter();
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    setLoading(true);
    const subscription = await getLocalSubscription();
    setCurrentSubscription(subscription);
    setLoading(false);
  };

  const getUserId = async (): Promise<string> => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      return userId || 'guest_user_' + Date.now();
    } catch (error) {
      return 'guest_user_' + Date.now();
    }
  };

  const handleUpgrade = async (planId: SubscriptionPlan, planName: string, amount: number) => {
    if (currentSubscription?.plan === planId) {
      Alert.alert('Already Active', `You are already on the ${planName} plan.`);
      return;
    }

    Alert.alert(
      'Confirm Upgrade',
      `Are you sure you want to upgrade to ${planName} plan for ${amount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: async () => {
            setUpgrading(true);
            
            const userId = await getUserId();
            
            // Send to backend
            const result = await sendSubscriptionToBackend(userId, planId, planName, amount);
            
            if (result.success) {
              // Update local subscription
              const newSubscription: SubscriptionStatus = {
                plan: planId,
                isActive: true,
                features: getFeaturesForPlan(planId),
              };
              await updateLocalSubscription(newSubscription);
              setCurrentSubscription(newSubscription);
              
              Alert.alert('Success!', `You have successfully upgraded to ${planName} plan!`);
            } else {
              Alert.alert('Upgrade Failed', result.message || 'Something went wrong. Please try again.');
            }
            
            setUpgrading(false);
          },
        },
      ]
    );
  };

  const plans = [
    {
      id: 'free' as SubscriptionPlan,
      name: 'FREE TIER',
      price: '₹0',
      duration: 'forever',
      amount: 0,
      buttonText: 'Current Plan',
      buttonColor: '#4CAF50',
    },
    {
      id: 'monthly' as SubscriptionPlan,
      name: 'MONTHLY',
      price: '₹99',
      duration: '/month',
      amount: 99,
      buttonText: 'Go Premium',
      buttonColor: '#FF6B8A',
    },
    {
      id: 'yearly' as SubscriptionPlan,
      name: 'YEARLY',
      price: '₹899',
      duration: '/year',
      amount: 899,
      buttonText: 'Save 25% Yearly',
      buttonColor: '#FF6B8A',
    },
  ];

  const renderPlanCard = (plan: typeof plans[0]) => {
    const isActive = currentSubscription?.plan === plan.id;
    const features = getFeaturesForPlan(plan.id);
    
    return (
      <View key={plan.id} style={[styles.planCard, isActive && styles.activePlanCard]}>
        {isActive && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>CURRENT PLAN</Text>
          </View>
        )}
        
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.planPrice}>{plan.price}</Text>
            <Text style={styles.planDuration}>{plan.duration}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {features.map((feature: string, index: number) => (
          <View key={index} style={styles.featureItem}>
            <Icon name="check-circle" size={14} color="#FF6B8A" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.planButton,
            { backgroundColor: isActive ? '#E8E8E8' : plan.buttonColor },
          ]}
          onPress={() => handleUpgrade(plan.id, plan.name, plan.amount)}
          disabled={isActive || upgrading}
        >
          {upgrading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.planButtonText, isActive && styles.activeButtonText]}>
              {isActive ? 'Current Plan' : plan.buttonText}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B8A" />
        <Text style={styles.loadingText}>Loading subscription details...</Text>
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
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-left" size={22} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium Access</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Current Plan Info */}
        {currentSubscription && (
          <View style={styles.currentPlanBanner}>
            <Icon name="star" size={20} color="#FFD700" />
            <View style={styles.currentPlanTextContainer}>
              <Text style={styles.currentPlanLabel}>Current Plan</Text>
              <Text style={styles.currentPlanName}>
                {currentSubscription.plan.toUpperCase()} PLAN
              </Text>
            </View>
          </View>
        )}

        {/* Subtitle */}
        <Text style={styles.subtitle}>Unlock Unlimited Style</Text>
        <Text style={styles.description}>
          Choose a plan that fits your fashion journey and never stop experimenting.
        </Text>

        {/* Plans */}
        {plans.map(renderPlanCard)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  loadingContainer: {
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2F343A',
  },
  currentPlanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  currentPlanTextContainer: {
    flex: 1,
  },
  currentPlanLabel: {
    fontSize: 11,
    color: '#888',
  },
  currentPlanName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B8A',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2F343A',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 18,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  activePlanCard: {
    borderWidth: 2,
    borderColor: '#FF6B8A',
  },
  currentBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#FF6B8A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F343A',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF6B8A',
  },
  planDuration: {
    fontSize: 14,
    color: '#888',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    color: '#555',
  },
  planButton: {
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  planButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  activeButtonText: {
    color: '#999',
  },
});