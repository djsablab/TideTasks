// RegisterScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validate username
  const isValidUsername = (username) => {
    const regex = /^[a-zA-Z0-9_]+$/; // Only letters, numbers, and underscores
    return regex.test(username) && username.length >= 3 && username.length <= 15;
  };

  // Validate password
  const isValidPassword = (password) => {
    return password.length >= 6; // Firebase default minimum password length
  };

  // Handle registration
  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("All fields are required.");
      return;
    }

    // Username validation
    if (!isValidUsername(username)) {
      Alert.alert("Username must be between 3-15 characters and contain only letters, numbers, or underscores.");
      return;
    }

    // Password validation
    if (!isValidPassword(password)) {
      Alert.alert("Password must be at least 6 characters long.");
      return;
    }

    // Confirm password check
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match.");
      return;
    }

    try {
      // Create account with email + password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Auth profile (sets displayName)
      await updateProfile(user, {
        displayName: username,
      });

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        createdAt: new Date(),
      });

      Alert.alert("Registration successful!");
      navigation.goBack();

    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Button title="Sign Up" onPress={handleRegister} />

      <Text style={styles.link} onPress={() => navigation.goBack()}>
        Already have an account? Login
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  header: { fontSize: 32, textAlign: 'center', marginBottom: 20 },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  link: { color: '#007bff', textAlign: 'center', marginTop: 20 },
});

export default RegisterScreen;
