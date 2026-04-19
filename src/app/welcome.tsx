import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.namaste}>Namaste, Fashionista! 👋</Text>
      <Text style={styles.welcomeTitle}>Welcome to StyleSathy</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI-POWERED TRY-ON</Text>
        <Text style={styles.cardDesc}>
          Transform Your Style Virtually{'\n'}
          Discover the perfect jewelry and accessories that match your unique vibe instantly.
        </Text>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Get Started →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0f0a',
    padding: 20,
  },
  namaste: {
    fontSize: 24,
    color: '#D4A574',
    marginTop: 60,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#2c1810',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    color: '#D4A574',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardDesc: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#D4A574',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: '#1a0f0a',
    fontWeight: 'bold',
    fontSize: 16,
  },
});