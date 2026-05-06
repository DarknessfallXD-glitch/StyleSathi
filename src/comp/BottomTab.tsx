import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function BottomTab({ active }) {
  const router = useRouter();

  const tabs = [
    { name: "home", icon: "home", route: "./home" },
    { name: "search", icon: "search", route: "./search-result" },
    { name: "style", icon: "camera", route: "./try-on" },
    { name: "saved", icon: "heart-o", route: "./saved" },
    { name: "profile", icon: "user", route: "./profile" },
  ];

  return (
    <View style={styles.bottomTab}>
      {tabs.map((tab) => {
        const isActive = active === tab.name;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => router.push(tab.route)}
            activeOpacity={0.7}
          >
            <Icon
              name={tab.icon}
              size={22}
              color={isActive ? "#FF6B8A" : "#999"}
            />
            <Text style={[styles.tabText, isActive && styles.tabActive]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomTab: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },

  tabText: {
    fontSize: 10,
    color: "#999",
  },

  tabActive: {
    color: "#FF6B8A",
  },
});
