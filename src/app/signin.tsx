import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from 'expo-apple-authentication';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { supabase } from "../lib/supabase";

console.log("Redirect URI:", AuthSession.makeRedirectUri());
WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const router = useRouter();
  const [secure, setSecure] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "478569591036-6ss1sbl1mqhuggtdm5ekun5o188ojdsl.apps.googleusercontent.com",
    iosClientId:
      "478569591036-4stvl2r1r8snildbnmgvlhajn2b3l12a.apps.googleusercontent.com",
    webClientId:
      "478569591036-v0bj4glv8o9v7q66s7ovp86lfki0n66k.apps.googleusercontent.com",
    redirectUri: makeRedirectUri({
      scheme: "com.darknessfallxd.stylesathi",
    }),
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

  // Check if user is already logged in
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check if Supabase is configured
      if (!supabase) {
        console.log("Supabase not configured yet");
        return;
      }
      
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (session) {
        router.replace('/home');
      }
    } catch (error: any) {
      // Silently fail - user just needs to sign in manually
      console.log("Session check failed:", error.message);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to handle Supabase connection errors
  const handleSupabaseError = (error: any): string => {
    console.error("Supabase error:", error);
    
    // Network/Connection errors
    if (!error) return "Unable to connect. Please check your internet.";
    if (error.message === "Failed to fetch") return "Network error. Please check your connection.";
    if (error.message?.includes("network")) return "Network error. Please try again.";
    if (error.message?.includes("timeout")) return "Connection timeout. Please try again.";
    
    // Supabase configuration errors
    if (error.message?.includes("Invalid API key")) return "Authentication service is not configured yet.";
    if (error.message?.includes("Invalid JWT")) return "Service configuration issue. Please contact support.";
    if (error.message?.includes("URL is required")) return "Backend connection not configured.";
    
    // Auth errors
    if (error.message === "Invalid login credentials") return "Invalid email or password.";
    if (error.message?.includes("Email not confirmed")) return "Please verify your email before signing in.";
    if (error.message?.includes("User already registered")) return "An account with this email already exists.";
    if (error.message?.includes("Password should be at least 6 characters")) return "Password must be at least 6 characters.";
    
    // Default fallback
    return "Something went wrong. Please try again.";
  };

  // Email/Password Sign In with Supabase
  const handleSignIn = async () => {
    setErrors({});
    setConnectionError(null);
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      // Check if supabase is available
      if (!supabase || !supabase.auth) {
        throw new Error("Authentication service is not available");
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error) throw error;

      if (data?.user) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        Alert.alert("Success", "Logged in successfully!");
        router.replace("/home");
      } else {
        throw new Error("No user data returned");
      }
      
    } catch (error: any) {
      const errorMessage = handleSupabaseError(error);
      setConnectionError(errorMessage);
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Handler with Supabase
  const handleGoogleLogin = () => {
    setConnectionError(null);
    promptAsync();
  };

  // Handle Google response with Supabase
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;

      supabase.auth.signInWithIdToken({
        provider: 'google',
        token: authentication?.idToken!,
      }).then(async ({ data, error }) => {
        if (error) throw error;
        
        if (data?.user) {
          await AsyncStorage.setItem("user", JSON.stringify(data.user));
          Alert.alert("Success", `Welcome ${data.user.email}!`);
          router.replace("/home");
        } else {
          throw new Error("No user data returned");
        }
      }).catch((err) => {
        const errorMessage = handleSupabaseError(err);
        setConnectionError(errorMessage);
        Alert.alert("Login Failed", errorMessage);
      });
    } else if (response?.type === "error") {
      console.log("Google sign in cancelled or failed");
    }
  }, [response]);

  // Apple Sign-In Handler with Supabase
  const handleAppleLogin = async () => {
    // Apple Sign-In only works on iOS devices
    if (Platform.OS === 'web') {
      Alert.alert('Info', 'Apple Sign-In is only available on iOS devices');
      return;
    }

    setAppleLoading(true);
    setConnectionError(null);

    try {
      // Check if Apple Sign-In is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      
      if (!isAvailable) {
        Alert.alert('Not Available', 'Apple Sign-In is not available on this device');
        setAppleLoading(false);
        return;
      }

      // Perform Apple Sign-In
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('Apple User:', credential);

      if (!credential.identityToken) {
        throw new Error("No identity token received from Apple");
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) throw error;

      if (data?.user) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        Alert.alert('Success', `Welcome!`);
        router.replace('/home');
      } else {
        throw new Error("No user data returned");
      }
      
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        // User cancelled - do nothing
        console.log('User cancelled Apple Sign-In');
      } else {
        const errorMessage = handleSupabaseError(error);
        setConnectionError(errorMessage);
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setAppleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address first.');
      return;
    }
    
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      Alert.alert('Success', 'Password reset link sent to your email.');
    } catch (error: any) {
      const errorMessage = handleSupabaseError(error);
      Alert.alert('Error', errorMessage);
    }
  };

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("./welcome")}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign In</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.logoCircle}>
        <Icon name="bolt" size={26} color="#FFCC00" />
      </View>

      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>
        Ready for your next virtual try-on? Sign in to access your wardrobe.
      </Text>

      {/* Show connection error if any */}
      {connectionError && (
        <View style={styles.connectionErrorContainer}>
          <Icon name="exclamation-triangle" size={16} color="#FF4444" />
          <Text style={styles.connectionErrorText}>{connectionError}</Text>
        </View>
      )}

      {/* Email */}
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
            if (connectionError) setConnectionError(null);
          }}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {/* Password */}
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
            if (connectionError) setConnectionError(null);
          }}
        />
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Icon name={secure ? "eye" : "eye-slash"} size={18} color="#777" />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setRememberMe(!rememberMe)}
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

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSignIn}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.or}>OR SIGN IN WITH</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity
          style={styles.socialBtn}
          activeOpacity={0.7}
          onPress={handleGoogleLogin}
        >
          <Icon name="google" size={18} color="#DB4437" />
          <Text style={styles.socialLabel}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialBtn}
          activeOpacity={0.7}
          onPress={handleAppleLogin}
          disabled={appleLoading}
        >
          {appleLoading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <>
              <Icon name="apple" size={18} color="#000000" />
              <Text style={styles.socialLabel}>Apple</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Don't have an account?{" "}
        <Text style={styles.link} onPress={() => router.replace("/signup")}>
          Sign Up
        </Text>
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2F343A",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#2F343A",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 13,
    color: "#777",
    marginTop: 6,
    marginBottom: 30,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    color: "#555",
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDEDED",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#FF4444",
    backgroundColor: "#FFF0F0",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 11,
    color: "#FF4444",
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
  connectionErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FF4444",
  },
  connectionErrorText: {
    fontSize: 12,
    color: "#FF4444",
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#FF6B8A",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#FF6B8A",
  },
  remember: {
    fontSize: 12,
    color: "#666",
  },
  forgot: {
    fontSize: 12,
    color: "#FF6B8A",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#FF6B8A",
    borderRadius: 28,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: "#FFB3C1",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD",
  },
  or: {
    fontSize: 10,
    color: "#888",
    marginHorizontal: 10,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDEDED",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
  },
  socialLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
  },
  link: {
    color: "#FF6B8A",
    fontWeight: "600",
  },
});