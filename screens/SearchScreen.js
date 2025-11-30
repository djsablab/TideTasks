import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";

export default function SearchScreen({ isDarkMode }) {
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#16191dff" : "#ffffff" }, // Dynamic background color
      ]}
    >
      <Text style={[styles.title, { color: isDarkMode ? "#eceff4" : "#16191dff" }]}>Search</Text>
      <Text style={[styles.text, { color: isDarkMode ? "#d8dee9" : "#16191dff" }]}>
        This is the Search Screen.
      </Text>
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
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    textAlign: "center",
  },
});
