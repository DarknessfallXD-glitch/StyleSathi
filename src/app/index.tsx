import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>⚡</Text>
        </View>

        <Text style={styles.title}>StyleSathy</Text>
        <Text style={styles.subtitle}>ONE EARTH • ONE STYLE</Text>

        <View style={styles.divider} />

        <Text style={styles.loading}>INITIALIZING AI STUDIO...</Text>
      </View>

      <Text style={styles.footer}>POWERED BY SATHY</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    justifyContent: 'center', // true vertical center
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2F343A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    color: '#FFFFFF',
    fontSize: 26,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2F343A',
  },
  subtitle: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  divider: {
    width: 100,
    height: 1,
    backgroundColor: '#DDD',
    marginVertical: 16,
  },
  loading: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 40, // keeps it at bottom while rest stays centered
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
  },
});