import { useEffect } from 'react';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from "../Context/ThemeContext";

// Prevent the splash screen from auto-hiding before we're ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide the splash screen as soon as the layout is ready
    async function hide() {
      await SplashScreen.hideAsync();
    }
    hide();
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="signin" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="home" />
        <Stack.Screen name="search-result" />
        <Stack.Screen name="try-on" />
        <Stack.Screen name="saved" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}