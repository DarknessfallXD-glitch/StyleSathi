import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { ThemeProvider } from '../Context/ThemeContext';
import { ErrorBoundary } from '../comp/ErrorBoundary';
import { NetworkStatus } from '../comp/NetworkStatus';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Check session on app start
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Store token in AsyncStorage (for API client)
          await AsyncStorage.setItem('authToken', session.access_token);
          // If user is on a public screen, redirect to home
          const inAuthGroup = segments[0] === 'welcome' || segments[0] === 'signin' || segments[0] === 'signup';
          if (inAuthGroup) {
            router.replace('/home');
          }
        } else {
          // No session – if not on a public screen, redirect to welcome
          const inAuthGroup = segments[0] === 'welcome' || segments[0] === 'signin' || segments[0] === 'signup';
          if (!inAuthGroup && segments[0] !== 'home') {
            router.replace('/welcome');
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await AsyncStorage.setItem('authToken', session.access_token);
        // If on public screen, redirect to home
        const inAuthGroup = segments[0] === 'welcome' || segments[0] === 'signin' || segments[0] === 'signup';
        if (inAuthGroup) {
          router.replace('/home');
        }
      } else {
        await AsyncStorage.removeItem('authToken');
        // If not on public screen, redirect to welcome
        const inAuthGroup = segments[0] === 'welcome' || segments[0] === 'signin' || segments[0] === 'signup';
        if (!inAuthGroup && segments[0] !== 'home') {
          router.replace('/welcome');
        }
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [segments, router]);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NetworkStatus />
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="signin" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="callback" />
          <Stack.Screen name="home" />
          <Stack.Screen name="search-result" />
          <Stack.Screen name="try-on" />
          <Stack.Screen name="saved" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </ErrorBoundary>
  );
}