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

  const handleSignIn = async () => {
    setErrors({});
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const userData = {
        email: email.trim().toLowerCase(),
        provider: "email",
        loggedInAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      Alert.alert("Success", "Logged in successfully!");
      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Google Handler
  const handleGoogleLogin = () => {
    promptAsync();
  };

  // Handle Google response
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;

      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${authentication?.accessToken}` },
      })
        .then((res) => res.json())
        .then(async (userInfo) => {
          const userData = {
            id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name || userInfo.email?.split("@")[0],
            picture: userInfo.picture,
            provider: "google",
            loggedInAt: new Date().toISOString(),
          };
          await AsyncStorage.setItem("user", JSON.stringify(userData));
          Alert.alert("Success", `Welcome ${userData.name}!`);
          router.replace("/home");
        })
        .catch((err) => {
          console.error(err);
          Alert.alert("Error", "Failed to get Google user info");
        });
    } else if (response?.type === "error") {
      console.log("Google sign in cancelled or failed");
    }
  }, [response]);

  // Apple Sign-In Handler
  const handleAppleLogin = async () => {
    // Apple Sign-In only works on iOS devices
    if (Platform.OS === 'web') {
      Alert.alert('Info', 'Apple Sign-In is only available on iOS devices');
      return;
    }

    setAppleLoading(true);

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

      // Prepare user data
      const userData = {
        id: credential.user,
        name: credential.fullName?.givenName || credential.fullName?.nickname || 'Apple User',
        email: credential.email || 'user@privaterelay.appleid.com',
        provider: 'apple',
        loggedInAt: new Date().toISOString(),
        isAuthenticated: true,
      };

      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      Alert.alert('Success', `Welcome ${userData.name}!`);
      router.replace('/home');

    } catch (error: any) {
      console.error('Apple Sign-In error:', error);
      if (error.code === 'ERR_CANCELED') {
        // User cancelled - do nothing
        console.log('User cancelled Apple Sign-In');
      } else {
        Alert.alert('Error', 'Apple Sign-In failed. Please try again.');
      }
    } finally {
      setAppleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Reset Password",
      "Password reset link will be sent to your email.",
    );
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