import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const router = useRouter();
  const [secure, setSecure] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  // Google Sign-In
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '478569591036-v0bj4glv8o9v7q66s7ovp86lfki0n66k.apps.googleusercontent.com',
  });

  useEffect(() => {
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

  // ==================== EMAIL VALIDATION ====================
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ==================== FORM VALIDATION ====================
  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address (e.g., name@example.com)';
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (password.length > 50) {
      newErrors.password = 'Password must be less than 50 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== EMAIL/PASSWORD SIGN IN ====================
  const handleSignIn = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check network connection
      if (!navigator.onLine && Platform.OS === 'web') {
        throw new Error('No internet connection. Please check your network.');
      }
      
      // Prepare data for backend
      const loginData = {
        type: 'email_password',
        email: email.trim().toLowerCase(),
        password: password,
        rememberMe: rememberMe,
        timestamp: new Date().toISOString(),
        deviceInfo: {
          platform: Platform.OS,
          appVersion: '2.4.1',
        },
      };
      
      console.log('📤 Email Login Data:', JSON.stringify(loginData, null, 2));
      
      // Simulate API call - Replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store user data locally
      const userData = {
        email: email.trim().toLowerCase(),
        provider: 'email',
        loggedInAt: new Date().toISOString(),
        isAuthenticated: true,
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      if (rememberMe) {
        await AsyncStorage.setItem('rememberedEmail', email.trim().toLowerCase());
      }
      
      console.log('✅ Login successful for:', email);
      Alert.alert('Success', 'Logged in successfully!');
      router.replace('/home');
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Handle different error types
      if (error.message.includes('internet') || error.message.includes('network')) {
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else if (error.message.includes('timeout')) {
        Alert.alert('Timeout Error', 'Request took too long. Please try again.');
      } else {
        Alert.alert('Login Failed', error.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== GOOGLE SIGN IN ====================
const handleGoogleLogin = async () => {
  // Prevent multiple clicks
  if (googleLoading) return;
  
  setGoogleLoading(true);
  
  // Set a timeout to reset loading if user takes too long
  const timeoutId = setTimeout(() => {
    if (googleLoading) {
      setGoogleLoading(false);
      console.log('Google Sign-In timed out');
    }
  }, 30000); // 30 seconds timeout
  
  try {
    // Check if the request is ready
    if (!request) {
      throw new Error('Google Sign-In is not initialized. Please try again.');
    }
    
    // Prompt Google Sign-In
    await promptAsync();
    
    // Clear timeout on success
    clearTimeout(timeoutId);
    
  } catch (error: any) {
    console.error('❌ Google Sign-In error:', error);
    clearTimeout(timeoutId);
    
    if (error.message?.includes('cancel') || error.message?.includes('dismiss')) {
      // User cancelled - just reset loading, no error message
      setGoogleLoading(false);
    } else if (error.message?.includes('internet') || error.message?.includes('network')) {
      Alert.alert('Network Error', 'Please check your internet connection and try again.');
      setGoogleLoading(false);
    } else {
      Alert.alert('Google Sign-In Error', error.message || 'Failed to open Google Sign-In. Please try again.');
      setGoogleLoading(false);
    }
  }
};
  // ==================== HANDLE GOOGLE RESPONSE ====================
  useEffect(() => {
    const handleGoogleResponse = async () => {
      // Handle successful response
      if (response?.type === 'success') {
        const { authentication } = response;
        
        // Validate authentication object
        if (!authentication || !authentication.accessToken) {
          Alert.alert('Error', 'Failed to get authentication token. Please try again.');
          setGoogleLoading(false);
          return;
        }
        
        try {
          // Fetch user info from Google
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              Authorization: `Bearer ${authentication.accessToken}`,
            },
          });
          
          // Check if fetch was successful
          if (!userInfoResponse.ok) {
            throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
          }
          
          const userInfo = await userInfoResponse.json();
          
          // Validate user info
          if (!userInfo.email) {
            throw new Error('Could not retrieve email from Google');
          }
          
          console.log('✅ Google User Info:', userInfo);
          
          // Store user data
          const userData = {
            id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name || userInfo.email?.split('@')[0],
            picture: userInfo.picture,
            provider: 'google',
            loggedInAt: new Date().toISOString(),
            isAuthenticated: true,
          };
          
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          console.log('✅ User saved successfully');
          
          Alert.alert('Success', `Welcome ${userData.name}!`);
          router.replace('/home');
          
        } catch (error: any) {
          console.error('❌ Error fetching Google user info:', error);
          Alert.alert(
            'Login Error',
            error.message || 'Failed to get your information from Google. Please try again.'
          );
          setGoogleLoading(false);
        }
      } 
      // Handle error response
      else if (response?.type === 'error') {
        console.error('❌ Google response error:', response.error);
        
        // Handle different error types
        if (response.error?.message?.includes('popup')) {
          Alert.alert('Popup Blocked', 'Please allow popups for this site and try again.');
        } else if (response.error?.message?.includes('network')) {
          Alert.alert('Network Error', 'Please check your internet connection.');
        } else {
          Alert.alert('Google Sign-In Failed', response.error?.message || 'Something went wrong. Please try again.');
        }
        setGoogleLoading(false);
      }
    };
    
    handleGoogleResponse();
  }, [response]);

  // ==================== APPLE SIGN IN (Placeholder) ====================
  const handleAppleLogin = () => {
    Alert.alert(
      'Apple Sign-In',
      'Apple Sign-In will be available in the next update!',
      [{ text: 'OK' }]
    );
  };

  // ==================== FORGOT PASSWORD ====================
  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Enter your email address and we will send you a link to reset your password.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            if (!email) {
              Alert.alert('Error', 'Please enter your email address first.');
            } else if (!validateEmail(email)) {
              Alert.alert('Error', 'Please enter a valid email address.');
            } else {
              Alert.alert('Success', `Password reset link sent to ${email}`);
            }
          },
        },
      ]
    );
  };

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
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign In</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Logo */}
      <View style={styles.logoCircle}>
        <Icon name="bolt" size={26} color="#FFCC00" />
      </View>

      {/* Title */}
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>
        Ready for your next virtual try-on? Sign in to access your wardrobe.
      </Text>

      {/* Email Input */}
      <Text style={styles.label}>Email or Phone Number</Text>
      <View style={[styles.inputBox, errors.email && styles.inputError]}>
        <Icon name="envelope" size={16} color="#999" style={styles.inputIcon} />
        <TextInput
          placeholder="name@example.com"
          placeholderTextColor="#999"
          style={styles.input}
          selectionColor="#FF6B8A"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading && !googleLoading}
        />
      </View>
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {/* Password Input */}
      <Text style={styles.label}>Password</Text>
      <View style={[styles.inputBox, errors.password && styles.inputError]}>
        <Icon name="lock" size={16} color="#999" style={styles.inputIcon} />
        <TextInput
          placeholder="••••••••"
          placeholderTextColor="#999"
          secureTextEntry={secure}
          style={styles.input}
          selectionColor="#FF6B8A"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors({ ...errors, password: undefined });
          }}
          editable={!isLoading && !googleLoading}
        />
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Icon name={secure ? "eye" : "eye-slash"} size={18} color="#777" />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {/* Remember / Forgot */}
      <View style={styles.row}>
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => setRememberMe(!rememberMe)}
          disabled={isLoading || googleLoading}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <Icon name="check" size={10} color="#FFFFFF" />}
          </View>
          <Text style={styles.remember}>Remember me</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity 
        style={[styles.button, (isLoading || googleLoading) && styles.buttonDisabled]}
        onPress={handleSignIn}
        activeOpacity={0.8}
        disabled={isLoading || googleLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.or}>OR SIGN IN WITH</Text>
        <View style={styles.line} />
      </View>

      {/* Social Buttons */}
      <View style={styles.socialRow}>
        <TouchableOpacity 
          style={[styles.socialBtn, (isLoading || googleLoading) && styles.socialBtnDisabled]}
          activeOpacity={0.7}
          onPress={handleGoogleLogin}
          disabled={isLoading || googleLoading}
        >
          {googleLoading ? (
            <ActivityIndicator size="small" color="#DB4437" />
          ) : (
            <>
              <Icon name="google" size={18} color="#DB4437" />
              <Text style={styles.socialLabel}>Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.socialBtn, (isLoading || googleLoading) && styles.socialBtnDisabled]}
          activeOpacity={0.7}
          onPress={handleAppleLogin}
          disabled={isLoading || googleLoading}
        >
          <Icon name="apple" size={18} color="#000000" />
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
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF4444',
    backgroundColor: '#FFF0F0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 11,
    color: '#FF4444',
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
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
  buttonDisabled: {
    backgroundColor: '#FFB3C1',
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
  socialBtnDisabled: {
    opacity: 0.6,
  },
  socialLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
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