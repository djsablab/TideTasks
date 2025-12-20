/* -------------------- Imports -------------------- */
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import ToastManager, { Toast } from "toastify-react-native";
import FirebaseErrorParser from "../components/FirebaseErrorParser";
import RoundedButton from "../components/RoundedButton";

const RegisterScreen = ({ navigation }) => {
  /* -------------------- States -------------------- */
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* -------------------- Validation -------------------- */
  const isValidUsername = (value) => /^[a-zA-Z0-9_]{3,15}$/.test(value);

  const isValidPassword = (value) => value.length >= 6;

  const usernameError = useMemo(() => {
    if (!username) return null;
    return isValidUsername(username)
      ? null
      : "3–15 chars, letters, numbers, underscores only";
  }, [username]);

  const passwordError = useMemo(() => {
    if (!password) return null;
    return isValidPassword(password)
      ? null
      : "Password must be at least 6 characters";
  }, [password]);

  const confirmPasswordError = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword ? null : "Passwords do not match";
  }, [password, confirmPassword]);

  const isFormValid =
    isValidUsername(username) &&
    email.length > 0 &&
    isValidPassword(password) &&
    password === confirmPassword &&
    !loading;

  /* -------------------- Submit -------------------- */
  const handleRegister = async () => {
    if (!isFormValid) return;
    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName: username });
      await setDoc(doc(db, "users", user.uid), {
        username,
        email: email.trim(),
        createdAt: new Date(),
      });
      Toast.success("Registration successful! You can now log in.", "bottom");
    } catch (error) {
      Toast.error(FirebaseErrorParser(error), "bottom");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Sign Up to TideTasks</Text>
        <TextInput
          style={[styles.input, usernameError && styles.errorBorder]}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          placeholderTextColor="#999"
        />
        {usernameError && <Text style={styles.errorText}>{usernameError}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          placeholderTextColor="#999"
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
            placeholderTextColor="#999"
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

        <TextInput
          style={[styles.input, confirmPasswordError && styles.errorBorder]}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          returnKeyType="done"
          onSubmitEditing={handleRegister}
          placeholderTextColor="#999"
        />
        {confirmPasswordError && (
          <Text style={styles.errorText}>{confirmPasswordError}</Text>
        )}

        <RoundedButton
          title={loading ? "Signing Up..." : "Sign Up"}
          onPress={handleRegister}
          disabled={!isFormValid}
          style={{ marginTop: 10 ,backgroundColor: isFormValid ? "#1761a1ff" : "#a0c4e896"}}
        />

        <Text style={styles.link} onPress={() => navigation.goBack()}>
          Already have an account? Login
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
    color: "#000",
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
    marginBottom: 6,
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

export default RegisterScreen;
