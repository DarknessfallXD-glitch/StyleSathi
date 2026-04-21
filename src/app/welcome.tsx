import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Text style={styles.greeting}>Namaste, Fashionista! ✨</Text>
        <Text style={styles.title}>Welcome to StyleSathy</Text>

        {/* Card */}
        <View style={styles.card}>
          {/* ✅ IMAGE LEFT EXACTLY AS YOU HAD IT */}
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
            }}
            style={styles.image}
          />

          <View style={styles.badge}>
            <Text style={styles.badgeText}>⚡ StyleSathy</Text>
          </View>

          <View style={styles.overlayText}>
            <Text style={styles.smallLabel}>AI-POWERED TRY-ON</Text>

            <Text style={styles.bigText}>Transform Your Style</Text>
            <Text style={styles.highlight}>Virtually</Text>

            <Text style={styles.desc}>
              Discover the perfect jewelry and accessories that match your
              unique vibe instantly.
            </Text>
          </View>
        </View>

        {/* Why section */}
        <Text style={styles.sectionTitle}>WHY YOU'LL LOVE US</Text>

        <View style={styles.tags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>✨ Instant Virtual Try-On</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>→ Local Retailers</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>✨ Smart Styling</Text>
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/signin")}
        >
          <Text style={styles.buttonText}>Get Started →</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.signIn}>
          Already have an account?{" "}
          <Text style={styles.link} onPress={() => router.replace("/signin")}>
            Sign In
          </Text>
        </Text>

        <Text style={styles.terms}>
          By continuing, you agree to StyleSathy's Terms of Service and Privacy
          Policy.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 50, // ✅ FIX: prevents bottom cut-off
  },

  greeting: {
    fontSize: 14,
    color: "#777",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 16,
    color: "#2F343A",
  },

  card: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    height: "62%",
  },

  image: {
    width: "100%",
    height: 500,
  },

  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },

  overlayText: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },

  smallLabel: {
    fontSize: 15,
    color: "#ff315e",
    marginBottom: 6,
  },

  bigText: {
    fontSize: 30,
    fontWeight: "700",
    color: "#fefefe",
  },

  highlight: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f54168",
  },

  desc: {
    fontSize: 14,
    color: "#9b9696",
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 13,
    color: "#ff6767",
    marginBottom: 10,
  },

  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 25,
  },

  tag: {
    backgroundColor: "#EDEDED",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },

  tagText: {
    fontSize: 11,
    color: "#444",
  },

  button: {
    backgroundColor: "#FF6B8A",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 12,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  signIn: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
    marginTop: 6,
  },

  link: {
    color: "#FF6B8A",
    fontWeight: "600",
  },

  terms: {
    textAlign: "center",
    fontSize: 10,
    color: "#aaa",
    marginTop: 8,
  },
});
