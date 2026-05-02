import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Image, // Add this import
} from 'react-native';
import { useRouter } from 'expo-router';

export default function SignInScreen() {
  const router = useRouter();
  const [secure, setSecure] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Animation values
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
        }
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('./welcome')}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign In</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Logo */}
      <View style={styles.logoCircle}>
        <Text style={styles.logoIcon}><Icon name="bolt" size={22} color="#FFCC00" />
</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>
        Ready for your next virtual try-on? Sign in to access your wardrobe.
      </Text>

      {/* Email */}
      <Text style={styles.label}>Email or Phone Number</Text>
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

      {/* Remember / Forgot */}
      <View style={styles.row}>
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.remember}>Remember me</Text>
        </TouchableOpacity>
        
        <TouchableOpacity>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity 
        style={styles.button}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.or}>OR SIGN IN WITH</Text>
        <View style={styles.line} />
      </View>

      {/* Social Buttons - Both Google and Apple */}
      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
         <Image 
            source={{ uri: 'data:image/jpeg;base64,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' }}
            style={styles.appleLogo}
          />
          <Text style={styles.socialLabel}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
          <Image 
            source={{ uri: 'https://e7.pngegg.com/pngimages/394/395/png-clipart-computer-icons-apple-logo-apple-computer-logo.png' }}
            style={styles.appleLogo}
          />
          <Text style={styles.socialLabel}>Apple</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Don't have an account?{' '}
        <Text
          style={styles.link}
          onPress={() => router.replace('/signup')}
        >
          Sign Up
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
    marginLeft:5 ,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 12,
    marginLeft: 4,
  },

  eye: {
    fontSize: 18,
    color: '#777',
    paddingHorizontal: 8,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FF6B8A',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  checkboxChecked: {
    backgroundColor: '#FF6B8A',
  },

  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  remember: {
    fontSize: 12,
    color: '#666',
  },

  forgot: {
    fontSize: 12,
    color: '#FF6B8A',
    fontWeight: '500',
  },

  button: {
    backgroundColor: '#FF6B8A',
    borderRadius: 28,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
  },

  or: {
    fontSize: 10,
    color: '#888',
    marginHorizontal: 10,
  },

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },

  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDEDED',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
  },

  socialText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },

  socialLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  // Add this style for Apple logo
  appleLogo: {
    width: 18,  // Small size
    height: 18, // Small size
    resizeMode: 'contain',
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