import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function SignUpScreen() {
  const router = useRouter();
  const [secure, setSecure] = useState(true);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('./signin   ')}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign Up</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Logo */}
      <View style={styles.logoCircle}>
        <Text style={styles.logoIcon}><Icon name="bolt" size={22} color="#FFCC00" /></Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>
        Join StyleSathy and start your virtual styling journey.
      </Text>

      {/* Name */}
      <Text style={styles.label}>Full Name</Text>
      <View style={styles.inputBox}>
        <TextInput
          placeholder="Your name"
          placeholderTextColor="#999"
          style={styles.input}
          selectionColor="#FF6B8A"
        />
      </View>

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <View style={styles.inputBox}>
        <TextInput
          placeholder="name@example.com"
          placeholderTextColor="#999"
          style={styles.input}
          selectionColor="#FF6B8A"
        />
      </View>

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <View style={styles.inputBox}>
        <TextInput
          placeholder="••••••••"
          placeholderTextColor="#999"
          secureTextEntry={secure}
          style={styles.input}
          selectionColor="#FF6B8A"
        />
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Text style={styles.eye}>
            <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Icon name={secure ? "eye" : "eye-slash"} size={18} color="#777" />
          </TouchableOpacity>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.button} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text style={styles.footer}>
        Already have an account?{' '}
        <Text
          style={styles.link}
          onPress={() => router.replace('./signin')}
        >
          Sign In
        </Text>
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },

  back: {
    fontSize: 28,
    color: '#333',
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2F343A',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },

  logoIcon: {
    color: '#fff',
    fontSize: 22,
  },

  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#2F343A',
  },

  subtitle: {
    textAlign: 'center',
    fontSize: 13,
    color: '#777',
    marginTop: 6,
    marginBottom: 30,
    paddingHorizontal: 10,
    lineHeight: 18,
  },

  label: {
    fontSize: 12,
    color: '#555',
    marginBottom: 6,
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
    marginLeft: 5,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 12,
    padding:10,
  },

  eye: {
    fontSize: 18,
    color: '#777',
    paddingHorizontal: 8,
  },

  button: {
    backgroundColor: '#FF6B8A',
    borderRadius: 28,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
  },

  link: {
    color: '#FF6B8A',
    fontWeight: '600',
  },
});