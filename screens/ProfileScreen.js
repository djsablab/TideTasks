import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../firebase";  // Import Firebase auth
import { signOut } from "firebase/auth";  // Import Firebase signOut function

export default function ProfileScreen({ toggleTheme, isDarkMode }) {
  const [user, setUser] = useState(null); // Store the user object here

  // Fetch the user info when the component mounts
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Log out the user
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase sign out
      Alert.alert("Logged out successfully!");
    } catch (error) {
      Alert.alert("Error", error.message); // Show any error message
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#16191dff" : "#ffffff" }, // Update background based on theme
      ]}
    >
      <Text style={[styles.title, { color: isDarkMode ? "#eceff4" : "#2e3440" }]}>Profile</Text>

      {/* Display user information */}
      {user ? (
        <View style={styles.userInfoContainer}>
          <Text style={[styles.userInfoText, { color: isDarkMode ? "#eceff4" : "#2e3440" }]}>
            Email: {user.email}
          </Text>
          <Text style={[styles.userInfoText, { color: isDarkMode ? "#eceff4" : "#2e3440" }]}>
            Display Name: {user.displayName || "Not Set"}
          </Text>
        </View>
      ) : (
        <Text style={[styles.userInfoText, { color: isDarkMode ? "#eceff4" : "#2e3440" }]}>
          No user information available.
        </Text>
      )}

      {/* Toggle button to change theme */}
      <View style={styles.optionContainer}>
        <Text style={[styles.optionText, { color: isDarkMode ? "#eceff4" : "#2e3440" }]}>Theme</Text>
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.toggleButton,
            {
              backgroundColor: isDarkMode ? "#434c5e" : "#eceff4", // Change background color based on the theme
            },
          ]}
          onPress={toggleTheme}
        >
          <Ionicons
            name={isDarkMode ? "moon" : "sunny"}
            size={30}
            color={isDarkMode ? "#eceff4" : "#2e3440"}
          />
          <Text style={[styles.toggleText, { color: isDarkMode ? "#eceff4" : "#2e3440" }]}>
            {isDarkMode ? "Night" : "Day"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  optionText: {
    fontSize: 18,
    marginRight: 10,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    transition: "background-color 0.3s ease", // Smooth transition effect
  },
  toggleText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "600",
  },
  userInfoContainer: {
    marginBottom: 30,
  },
  userInfoText: {
    fontSize: 18,
    marginBottom: 5,
  },
  logoutButton: {
    backgroundColor: "#ff4d4d", // Red background for logout
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
