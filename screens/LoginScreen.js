/* -------------------- Imports -------------------- */
import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { auth } from "../firebase"; // Import Firebase auth from your firebase.js file
import { signInWithEmailAndPassword } from "firebase/auth";
import RoundedButton from "../components/RoundedButton";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native";
import { Platform } from "react-native";
import FirebaseErrorParser from "../components/FirebaseErrorParser";
import ToastManager, { Toast } from "toastify-react-native";

const LoginScreen = ({ navigation }) => {
  /* -------------------- States -------------------- */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  /* -------------------- Handle Login -------------------- */
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Reset the navigation stack and navigate to MainStack
      navigation.reset({
        index: 0,
        routes: [{ name: "MainStack" }], // Navigate to the MainStack, which contains the Tab Navigator
      });
    } catch (error) {
      Toast.error(FirebaseErrorParser(error), "bottom");
    }
  };
  /* -------------------- UI -------------------- */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <View style={styles.passwordRow}>
          <TextInput
            style={[
              styles.input,
              styles.passwordInput,
              passwordError && styles.errorBorder,
            ]}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            returnKeyType="next"
          />
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={25}
              color="black"
              style={styles.toggleText}
            />
          </TouchableOpacity>
        </View>
        {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
        <RoundedButton
          title="Login"
          onPress={handleLogin}
          style={{ backgroundColor: "#1e88e5" }}
        />
        <Text
          style={styles.link}
          onPress={() => navigation.navigate("Register")} // Navigate to Register screen
        >
          Don't have an account? Sign up
        </Text>
      </View>
      <ToastManager />
    </KeyboardAvoidingView>
  );
};
/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  header: {
    fontSize: 32,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "600",
  },
  input: {
    height: 50,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
  },
  toggleText: {
    marginLeft: 10,
    color: "#007bff",
    fontWeight: "500",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
  errorBorder: {
    borderColor: "red",
  },
  link: {
    color: "#007bff",
    textAlign: "center",
    marginTop: 20,
  },
});

export default LoginScreen;
