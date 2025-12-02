import React, { useState, useEffect } from "react";
import {
  Animated,
  View,
  TouchableWithoutFeedback,
  Text,
  StyleSheet,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { auth } from "./firebase";

// Import screens
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

// Import Ionicons for tab icons
import { Ionicons } from "@expo/vector-icons";
import { DefaultTheme, DarkTheme } from "@react-navigation/native";
import { StatusBar } from "react-native";
import MTControlScreen from "./screens/MTControlScreen";

import { GestureHandlerRootView } from "react-native-gesture-handler";
// Define the Tab navigator
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// MainStack that contains the tab screens (Home, Search, Profile)
function MainStack({ isDarkMode, toggleTheme }) {
  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} isDarkMode={isDarkMode} />} // Pass isDarkMode to tab bar
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home">
        {(props) => <HomeScreen {...props} isDarkMode={isDarkMode} />}
      </Tab.Screen>
      <Tab.Screen name="AddTask" text="A">
        {(props) => <MTControlScreen {...props} isDarkMode={isDarkMode} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {(props) => (
          <ProfileScreen
            {...props}
            toggleTheme={toggleTheme}
            isDarkMode={isDarkMode}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// AuthStack for login and registration screens
function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false, // Hide header for LoginScreen
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: false, // Hide header for RegisterScreen
        }}
      />
    </Stack.Navigator>
  );
}

// 🔥 Custom animated tab component
function AnimatedTabBar({ state, descriptors, navigation, isDarkMode }) {
  return (
    <View
      style={[
        styles.tabContainer,
        { backgroundColor: isDarkMode ? "#3b4252" : "#ffffff" }, // Dynamically change background color
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        // 🔥 Animation value
        const scaleAnim = React.useRef(
          new Animated.Value(isFocused ? 1.1 : 1)
        ).current;

        // Animate on focus
        React.useEffect(() => {
          Animated.spring(scaleAnim, {
            toValue: isFocused ? 1.2 : 1,
            useNativeDriver: true,
            friction: 6,
          }).start();
        }, [isFocused]);

        let iconName;
        if (route.name === "Home")
          iconName = isFocused ? "home" : "home-outline";
        if (route.name === "AddTask")
          iconName = isFocused ? "add" : "add-outline";
        if (route.name === "Profile")
          iconName = isFocused ? "person" : "person-outline";

        const onPress = () => {
          if (!isFocused) navigation.navigate(route.name);
        };

        return (
          <TouchableWithoutFeedback key={route.key} onPress={onPress}>
            <Animated.View
              style={[
                styles.iconWrapper,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Ionicons
                name={iconName}
                size={28}
                color={
                  isFocused
                    ? isDarkMode
                      ? "#81a1c1"
                      : "#5f9dd2"
                    : isDarkMode
                    ? "#d8dee9"
                    : "#3f4d58"
                }
              />
              {/* Add text under the "AddTask" tab */}
              {route.name === "AddTask" && true && (
                <Text
                  style={{
                    fontSize: 9,
                    color: isFocused
                      ? isDarkMode
                        ? "#81a1c1"
                        : "#5f9dd2"
                      : isDarkMode
                      ? "#d8dee9"
                      : "#3f4d58",
                    marginTop: 0, // Space between icon and text
                  }}
                >
                  Add Task
                </Text>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        );
      })}
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state

  // Check user authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user); // Set user if authenticated
      setLoading(false); // Finished loading, now show the app
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      // Show a loading screen while authentication is in progress
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Theme configurations
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: "#16191dff", // Soft dark gray
      card: "#3b4252", // Muted gray for the tab bar
      text: "#eceff4", // Light gray text for contrast
      border: "#434c5e", // Slightly darker gray for borders
      notification: "#81a1c1", // Soft blue for notifications (optional)
    },
  };

  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#f8f8f8", // Softer, off-white background
      card: "#d8dee9", // Light gray for tab bar background
      text: "#2e3440", // Dark gray text
      border: "#e5e9f0", // Subtle border color
      notification: "#88c0d0", // Soft blue for notifications (optional)
    },
  };

  // Toggle dark mode
  const toggleTheme = () => setIsDarkMode((prevMode) => !prevMode);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer
        theme={isDarkMode ? customDarkTheme : customLightTheme}
      >
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"} // Adapt status bar style
          backgroundColor={isDarkMode ? "#2e3440" : "#ffffff"} // Dark background for dark mode, light for light mode
        />
        {user === null ? (
          <AuthStack /> // Show Auth Stack if user is not logged in
        ) : (
          <MainStack isDarkMode={isDarkMode} toggleTheme={toggleTheme} /> // Show Main Stack if user is logged in
        )}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

// 🎨 Styling
const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    height: 60,
    borderRadius: 25,
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    height: 55,
    width: 55,
    borderRadius: 30,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
});
