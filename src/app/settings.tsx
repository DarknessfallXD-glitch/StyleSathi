import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();
  
  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [language, setLanguage] = useState('English');
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  // Load saved settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setNotificationsEnabled(parsed.notificationsEnabled ?? true);
        setDarkModeEnabled(parsed.darkModeEnabled ?? false);
        setEmailNotifications(parsed.emailNotifications ?? true);
        setSaveHistory(parsed.saveHistory ?? true);
        setSelectedLanguage(parsed.selectedLanguage ?? 'english');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      const existing = await AsyncStorage.getItem('userSettings');
      const settings = existing ? JSON.parse(existing) : {};
      settings[key] = value;
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const handleToggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    saveSetting('notificationsEnabled', value);
    Alert.alert('Success', `Notifications ${value ? 'enabled' : 'disabled'}`);
  };

  const handleToggleDarkMode = (value: boolean) => {
    setDarkModeEnabled(value);
    saveSetting('darkModeEnabled', value);
    Alert.alert('Coming Soon', 'Dark mode will be available in the next update!');
  };

  const handleToggleEmailNotifications = (value: boolean) => {
    setEmailNotifications(value);
    saveSetting('emailNotifications', value);
  };

  const handleToggleSaveHistory = (value: boolean) => {
    setSaveHistory(value);
    saveSetting('saveHistory', value);
  };

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    saveSetting('language', lang);
    Alert.alert('Language Changed', `Language set to ${lang}`);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data? This will not delete your saved items.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            try {
              // Clear only cache, not wishlist
              const wishlist = await AsyncStorage.getItem('wishlist');
              await AsyncStorage.clear();
              if (wishlist) {
                await AsyncStorage.setItem('wishlist', wishlist);
              }
              Alert.alert('Success', 'Cache cleared successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    type = 'link',
    value,
    onPress,
    onValueChange
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string; 
    type?: 'link' | 'toggle' | 'select';
    value?: boolean;
    onPress?: () => void;
    onValueChange?: (value: boolean) => void;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={type === 'toggle'}
      activeOpacity={type === 'toggle' ? 1 : 0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Icon name={icon} size={20} color="#FF6B8A" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {type === 'toggle' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E5E5E5', true: '#FF6B8A' }}
          thumbColor="#FFFFFF"
        />
      )}
      {type === 'link' && (
        <Icon name="chevron-right" size={16} color="#CCC" />
      )}
      {type === 'select' && (
        <Text style={styles.selectedValue}>{value}</Text>
      )}
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
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <SettingItem
            icon="bell-o"
            title="Push Notifications"
            subtitle="Receive updates about new arrivals and offers"
            type="toggle"
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
          />
          
          <SettingItem
            icon="moon-o"
            title="Dark Mode"
            subtitle="Switch to dark theme"
            type="toggle"
            value={darkModeEnabled}
            onValueChange={handleToggleDarkMode}
          />
          
          <SettingItem
            icon="envelope-o"
            title="Email Notifications"
            subtitle="Get emails about your orders and promotions"
            type="toggle"
            value={emailNotifications}
            onValueChange={handleToggleEmailNotifications}
          />
          
          <SettingItem
            icon="history"
            title="Save Search History"
            subtitle="Remember your recent searches"
            type="toggle"
            value={saveHistory}
            onValueChange={handleToggleSaveHistory}
          />
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          
          <TouchableOpacity 
            style={styles.languageOption}
            onPress={() => handleLanguageSelect('English')}
          >
            <View style={styles.languageLeft}>
              <Icon name="globe" size={20} color="#FF6B8A" />
              <Text style={styles.languageText}>English</Text>
            </View>
            {language === 'English' && (
              <Icon name="check" size={16} color="#FF6B8A" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.languageOption}
            onPress={() => handleLanguageSelect('नेपाली')}
          >
            <View style={styles.languageLeft}>
              <Icon name="flag" size={20} color="#FF6B8A" />
              <Text style={styles.languageText}>नेपाली (Nepali)</Text>
            </View>
            {language === 'नेपाली' && (
              <Icon name="check" size={16} color="#FF6B8A" />
            )}
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingItem
            icon="user-o"
            title="Edit Profile"
            onPress={() => router.push('/edit-profile')}
          />
          
          <SettingItem
            icon="credit-card"
            title="Payment Methods"
            onPress={() => router.push('/payment-methods')}
          />
          
          <SettingItem
            icon="map-marker"
            title="Shipping Addresses"
            onPress={() => router.push('/addresses')}
          />
          
          <SettingItem
            icon="lock"
            title="Privacy & Security"
            onPress={() => router.push('/privacy')}
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <SettingItem
            icon="question-circle-o"
            title="Help Center"
            onPress={() => router.push('/help')}
          />
          
          <SettingItem
            icon="star-o"
            title="Rate Us"
            onPress={() => Alert.alert('Rate Us', 'Thank you for rating StyleSathy!')}
          />
          
          <SettingItem
            icon="share-alt"
            title="Share App"
            onPress={() => Alert.alert('Share', 'Share StyleSathy with your friends!')}
          />
          
          <SettingItem
            icon="info-circle"
            title="About"
            onPress={() => router.push('/about')}
          />
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <SettingItem
            icon="trash-o"
            title="Clear Cache"
            onPress={handleClearCache}
          />
          
          <SettingItem
            icon="download"
            title="Export Data"
            onPress={() => Alert.alert('Export Data', 'Your data export will be sent to your email.')}
          />
        </View>

        {/* Version */}
        <Text style={styles.versionText}>Version 2.4.1</Text>
      </ScrollView>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2F343A',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B8A',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2F343A',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  selectedValue: {
    fontSize: 14,
    color: '#FF6B8A',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 1,
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  languageText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2F343A',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#CCC',
    marginTop: 20,
  },
});