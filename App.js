/* -------------------- Imports -------------------- */
import React, { useState, useEffect, useRef } from "react";
import { Animated, View, Text, StyleSheet, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { auth } from "./firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* -------------------- Import Screens -------------------- */
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import MTControlScreen from "./screens/MTControlScreen";
import OnboardingScreen from "./screens/onboarding/OnboardingScreen";
import { ONBOARDING_VERSION } from "./constants/onboarding";

/* -------------------- Import Components -------------------- */
import { Ionicons } from "@expo/vector-icons";
import { DefaultTheme, DarkTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/* -------------------- App -------------------- */
export default function App() {
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNavBar, setShowNavBar] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [ready, setReady] = useState(false);
  /* -------------------- Onboarding Check -------------------- */
  useEffect(() => {
    const init = async () => {
      const version = await AsyncStorage.getItem("onboardingVersion");
      setShowOnboarding(version !== ONBOARDING_VERSION);
      setReady(true);
      /* setShowOnboarding(true);     Handy for testing */
    };
    init();
  }, []);

  /* -------------------- Authentication -------------------- */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /* -------------------- Render Loading -------------------- */
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!ready) return null;

  if (showOnboarding) {
    return <OnboardingScreen onDone={() => setShowOnboarding(false)} />;
  }

  /* -------------------- Themes -------------------- */
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: "#16191dff",
      card: "#3b4252",
      text: "#eceff4",
      border: "#434c5e",
      notification: "#81a1c1",
    },
  };

  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#f8f8f8",
      card: "#d8dee9",
      text: "#2e3440",
      border: "#e5e9f0",
      notification: "#88c0d0",
    },
  };

  /* -------------------- Toggle Theme -------------------- */
  const toggleTheme = () => setIsDarkMode((prevMode) => !prevMode);

  /* -------------------- Main UI -------------------- */
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer
        theme={isDarkMode ? customDarkTheme : customLightTheme}
      >
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={isDarkMode ? "#2e3440" : "#ffffff"}
        />
        {user === null ? (
          <AuthStack />
        ) : (
          <MainStack
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            setShowNavBar={setShowNavBar}
            showNavBar={showNavBar}
          />
        )}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

/* -------------------- Main UI's Stack -------------------- */
function MainStack({ isDarkMode, toggleTheme, setShowNavBar, showNavBar }) {
  return (
    <Tab.Navigator
      tabBar={(props) => (
        <AnimatedTabBar
          {...props}
          isDarkMode={isDarkMode}
          showNavBar={showNavBar}
        />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home">
        {(props) => (
          <HomeScreen
            {...props}
            isDarkMode={isDarkMode}
            setShowNavBar={setShowNavBar}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="AddTask">
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

/* -------------------- Auth UI's Stack -------------------- */
function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

/* -------------------- Animated Tab Bar -------------------- */
function AnimatedTabBar({
  state,
  descriptors,
  navigation,
  isDarkMode,
  showNavBar,
}) {
  // Single Animated Value for opacity and translateY
  const fadeAnim = useRef(new Animated.Value(1)).current; // for opacity
  const translateYAnim = useRef(new Animated.Value(0)).current; // for slide in/out

  // Animate opacity and translateY when showNavBar changes
  useEffect(() => {
    // Animate opacity (fade in/out)
    Animated.timing(fadeAnim, {
      toValue: showNavBar ? 1 : 0, // Fade in or out based on showNavBar
      duration: 250,
      useNativeDriver: true,
    }).start();

    // Animate translateY (slide up/down)
    Animated.timing(translateYAnim, {
      toValue: showNavBar ? 0 : 20, // Slide in or out based on showNavBar
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [showNavBar]);

  /* -------------------- Render Tab Bar -------------------- */
  return (
    <Animated.View
      style={[
        styles.tabContainer,
        {
          backgroundColor: isDarkMode ? "#3b4252" : "#ffffff",
          opacity: fadeAnim, // Use fadeAnim for opacity
          transform: [{ translateY: translateYAnim }], // Use translateYAnim for sliding
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const scaleAnim = new Animated.Value(isFocused ? 1.1 : 1);

        useEffect(() => {
          Animated.spring(scaleAnim, {
            toValue: isFocused ? 1.1 : 1,
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
                { transform: [{ scale: scaleAnim }] },
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
              {route.name === "AddTask" && (
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
                  }}
                >
                  Add Task
                </Text>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        );
      })}
    </Animated.View>
  );
}

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 60,
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
