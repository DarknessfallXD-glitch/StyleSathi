import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import BottomTab from "../comp/BottomTab";

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        onPress: async () => {
          try {
            // Clear user data from storage
            await AsyncStorage.removeItem("user");
            await AsyncStorage.removeItem("userId");

            // Show success message
            Alert.alert(
              "Logged Out",
              "You have been successfully logged out.",
              [{ text: "OK", onPress: () => router.replace("/welcome") }],
            );
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to log out. Please try again.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Icon name="bolt" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("./settings")}>
            <Icon name="cog" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Profile */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150" }}
              style={styles.avatar}
            />
            <View style={styles.onlineDot} />
          </View>

          <Text style={styles.userName}>Sneha Sharma</Text>
          <Text style={styles.memberSince}>Member since June 2023</Text>
          <Text style={styles.tierLink}>Style Icon Tier</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="camera" size={18} color="#FF6B8A" />
            <Text style={styles.statNumber}>124</Text>
            <Text style={styles.statLabel}>Total Try-Ons</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Icon name="heart" size={18} color="#FF6B8A" />
            <Text style={styles.statNumber}>48</Text>
            <Text style={styles.statLabel}>Saved Items</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <Text style={styles.tabActiveText}>My Wardrobe</Text>
          <TouchableOpacity onPress={() => router.push("/subscription")}>
            <Text style={styles.tabTextInactive}>Subscription</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Tries */}
        <View>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Tries</Text>
            <Text style={styles.viewAllText}>View All</Text>
          </View>

          <View style={styles.recentContainer}>
            <TouchableOpacity style={styles.imageCard}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
                }}
                style={styles.cardImage}
              />
              <Text style={styles.imageLabel}>Earrings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.imageCard}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1611652022419-a9419f74343d",
                }}
                style={styles.cardImage}
              />
              <Text style={styles.imageLabel}>Necklace</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>STYLESATHY VERSION 2.4.1</Text>
      </ScrollView>

      <BottomTab active="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F4F4" },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 80,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatarWrapper: { position: "relative" },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },

  onlineDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#fff",
  },

  userName: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
  },

  memberSince: {
    fontSize: 12,
    color: "#888",
  },

  tierLink: {
    color: "#6C63FF",
    marginTop: 6,
  },

  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },

  statItem: { flex: 1, alignItems: "center" },

  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 6,
    color: "#FF6B8A",
  },

  statLabel: {
    fontSize: 11,
    color: "#888",
  },

  statDivider: {
    width: 1,
    backgroundColor: "#ddd",
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
  },

  tabActiveText: {
    color: "#FF6B8A",
    borderBottomWidth: 2,
    borderBottomColor: "#FF6B8A",
    paddingBottom: 4,
    fontWeight: "600",
  },

  tabTextInactive: {
    color: "#999",
  },

  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  recentTitle: {
    fontWeight: "600",
  },

  viewAllText: {
    color: "#FF6B8A",
    fontSize: 12,
  },

  recentContainer: {
    flexDirection: "row",
    gap: 10,
  },

  imageCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },

  cardImage: {
    width: "100%",
    height: 140,
  },

  imageLabel: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#00000088",
    color: "#fff",
    paddingHorizontal: 8,
    borderRadius: 6,
    fontSize: 11,
  },

  logoutButton: {
    borderWidth: 1,
    borderColor: "#FF6B8A",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 20,
  },

  logoutText: {
    color: "#FF6B8A",
    fontWeight: "600",
  },

  versionText: {
    textAlign: "center",
    fontSize: 10,
    color: "#aaa",
    marginTop: 20,
  },
});
