// ProfileScreen.js
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebase"; // Import Firebase auth and db
import {
  signOut,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth"; // Firebase auth methods
import {
  collection,
  updateDoc,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore"; // Firestore functions for fetching and updating user data
import RoundedButton from "../components/RoundedButton";
import Seperator from "../components/Seperator";

import App from "../App";

export default function ProfileScreen({ toggleTheme, isDarkMode }) {
  const [userData, setUserData] = useState({
    user: null,
    username: "",
    isEditing: false,
    isLoading: true,
    error: null,
    newUsername: "", // Ensure this property is defined here
    isPasswordModalVisible: false,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    passwordError: "",
    usernameModalVisible: false,
    newUsername: "",
  });
  const { usernameModalVisible, newUsername } = userData;

  let [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    checkedTasks: 0,
    uncheckedTasks: 0,
  });

  const uid = auth.currentUser?.uid;
  // Fetch user data from Firebase Auth and Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Set user from Firebase Auth
          setUserData((prevState) => ({ ...prevState, user: currentUser }));

          // Fetch username from Firestore
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserData((prevState) => ({
              ...prevState,
              username: userDoc.data().username,
            }));
          }
        }
      } catch (error) {
        setUserData((prevState) => ({
          ...prevState,
          error: error.message,
        }));
        console.error("Error fetching user data: ", error);
      } finally {
        setUserData((prevState) => ({ ...prevState, isLoading: false }));
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!uid) return;
    const ref = collection(db, "users", uid, "tasks");
    const unsub = onSnapshot(ref, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      const taskList = list.map((task) => ({
        ...task,
      }));
      // Calculate task statistics
      const totalTasks = taskList.length;
      const checkedTasks = taskList.filter((task) => task.completed).length;
      const uncheckedTasks = totalTasks - checkedTasks;
      setTaskStats({
        totalTasks,
        checkedTasks,
        uncheckedTasks,
      });
    });
    return unsub;
  }, [uid]);

  // Log out the user
  // Log out the user
  const handleLogout = async () => {
    // Reset to light mode on logout
    toggleTheme(false); // Call the toggleTheme function with false to set the theme to light mode
    try {
      await signOut(auth); // Firebase sign out
      Alert.alert("Logged out successfully!");
    } catch (error) {
      Alert.alert("Error", error.message); // Show any error message
    }
  };

  // Handle username change and save to Firestore
  const handleSaveUsername = async () => {
    const { newUsername, user } = userData;

    if (!newUsername) {
      Alert.alert("Username cannot be empty.");
      return;
    }

    try {
      // Update Firebase Auth profile (sets displayName)
      await updateProfile(user, { displayName: newUsername });

      // Update username in Firestore
      await updateDoc(doc(db, "users", user.uid), { username: newUsername });

      // Update local state with the new username and close modal
      setUserData((prevState) => ({
        ...prevState,
        username: newUsername, // Update the username to reflect the change
        usernameModalVisible: false, // Close the modal
      }));

      Alert.alert("Username updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update username.");
    }
  };

  // Show or hide password change modal
  const togglePasswordModal = () => {
    setUserData((prevState) => ({
      ...prevState,
      isPasswordModalVisible: !prevState.isPasswordModalVisible,
    }));
  };
  const toggleUsernameModal = () => {
    setUserData((prevState) => ({
      ...prevState,
      usernameModalVisible: !prevState.usernameModalVisible,
    }));
  };

  // Handle password change logic
  const handlePasswordChange = async () => {
    const { oldPassword, newPassword, confirmPassword, user } = userData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setUserData((prevState) => ({
        ...prevState,
        passwordError: "All fields are required.",
      }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setUserData((prevState) => ({
        ...prevState,
        passwordError: "New passwords do not match.",
      }));
      return;
    }

    if (newPassword.length < 6) {
      setUserData((prevState) => ({
        ...prevState,
        passwordError: "Password must be at least 6 characters.",
      }));
      return;
    }

    try {
      // Re-authenticate user to confirm they are the one changing the password
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      // Update the password
      await updatePassword(user, newPassword);

      setUserData((prevState) => ({
        ...prevState,
        passwordError: "",
        isPasswordModalVisible: false,
      }));
      Alert.alert("Password changed successfully!");
    } catch (error) {
      setUserData((prevState) => ({
        ...prevState,
        passwordError: error.message,
      }));
    }
  };

  // Loading, Error or User data state rendering
  const {
    isLoading,
    error,
    user,
    username,
    isEditing,
    isPasswordModalVisible,
    passwordError,
    oldPassword,
    newPassword,
    confirmPassword,
  } = userData;

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? "#16191dff" : "#ffffff00" },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={isDarkMode ? "#eceff4" : "#2e3440"}
        />
        <Text
          style={[styles.title, { color: isDarkMode ? "#eceff4" : "#2e3440" }]}
        >
          Loading...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? "#16191dff" : "#ffffff00" },
        ]}
      >
        <Text
          style={[styles.title, { color: isDarkMode ? "#eceff4" : "#2e3440" }]}
        >
          Error
        </Text>
        <Text
          style={[
            styles.errorText,
            { color: isDarkMode ? "#ff4d4d" : "#ff0000" },
          ]}
        >
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#16191dff" : "#ffffff00" },
      ]}
    >
      <Text
        style={[styles.title, { color: isDarkMode ? "#eceff4" : "#2e3440" }]}
      >
        Profile
      </Text>
      <TouchableOpacity
        activeOpacity={1}
        style={[
          styles.themeButton,
          { backgroundColor: isDarkMode ? "#434c5e" : "#eceff4" },
        ]}
        onPress={toggleTheme}
      >
        <Ionicons
          name={isDarkMode ? "moon" : "sunny"}
          size={30}
          color={isDarkMode ? "#eceff4" : "#2e3440"}
        />
      </TouchableOpacity>
      {/* Display user information */}
      {user ? (
        <View style={styles.userInfoContainer}>
          {/* Editable Username */}
          <TextInput
            style={[
              styles.input,
              {
                color: isDarkMode ? "#eceff4" : "#2e3440",
              },
            ]}
            value={username}
            onChangeText={(text) =>
              setUserData((prevState) => ({ ...prevState, username: text }))
            }
            editable={isEditing}
            placeholder="Username"
            placeholderTextColor={isDarkMode ? "#eceff4" : "#999"}
          />
          <Text
            style={[
              styles.userInfoText,
              { color: isDarkMode ? "#eceff4" : "#2e3440" },
            ]}
          >
            {user.email}
          </Text>

          {/* Edit/Save Username Button */}
          <View
            style={{
              marginTop: 10,
              alignItems: "center",
              width: "100%",
              flexDirection: "row",
              justifyContent: "center",
              gap: 20,
            }}
          >
            {/* Show or hide the edit/save button */}
            <RoundedButton
              title="Edit Username"
              onPress={toggleUsernameModal} // Toggles the modal visibility
              style={[
                styles.link,
                styles.toggleButton,
                {
                  backgroundColor: isDarkMode ? "#434c5e" : "#eceff4",
                },
              ]}
              textStyle={{
                color: isDarkMode ? "#eceff4" : "#2e3440",
              }}
            />

            {/* Change Password Button */}
            <RoundedButton
              onPress={togglePasswordModal}
              title="Change Password"
              style={[
                styles.link,
                styles.toggleButton,
                {
                  backgroundColor: isDarkMode ? "#434c5e" : "#eceff4",
                },
              ]}
              textStyle={{
                color: isDarkMode ? "#eceff4" : "#2e3440",
              }}
            />
          </View>

          <Seperator style={{ marginTop: 20 }} />
          {/* Display Task Statistics */}
          <View style={styles.statsContainer}>
            <Text
              style={[
                styles.statsText,
                {
                  color: isDarkMode ? "#eceff4" : "#2e3440",
                },
              ]}
            >
              <Ionicons
                name="clipboard-outline"
                size={16}
                color={isDarkMode ? "#eceff4" : "#2e3440"}
              />{" "}
              Total Tasks: {taskStats.totalTasks}
            </Text>
            <Text
              style={[
                styles.statsText,
                {
                  color: isDarkMode ? "#eceff4" : "#2e3440",
                },
              ]}
            >
              <Ionicons
                name="checkmark-done"
                size={16}
                color={isDarkMode ? "#eceff4" : "#2e3440"}
              />{" "}
              Checked Tasks: {taskStats.checkedTasks}
            </Text>
            <Text
              style={[
                styles.statsText,
                {
                  color: isDarkMode ? "#eceff4" : "#2e3440",
                },
              ]}
            >
              <Ionicons
                name="checkbox-outline"
                size={16}
                color={isDarkMode ? "#eceff4" : "#2e3440"}
              />{" "}
              Unchecked Tasks: {taskStats.uncheckedTasks}
            </Text>
          </View>

          <Seperator />
        </View>
      ) : (
        <Text
          style={[
            styles.userInfoText,
            { color: isDarkMode ? "#eceff4" : "#2e3440" },
          ]}
        >
          No user information available.
        </Text>
      )}

      {/* Logout Button */}
      <RoundedButton
        title="Log Out"
        onPress={handleLogout}
        style={{ backgroundColor: "#ff4d4d" }}
        textStyle={styles.logoutButtonText}
      />
      {/* Password Change Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isPasswordModalVisible}
        onRequestClose={togglePasswordModal}
      >
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDarkMode ? "#2e3440" : "#fff" },
            ]}
          >
            <Text
              style={[
                styles.title,
                { color: isDarkMode ? "#eceff4" : "#2e3440" },
              ]}
            >
              🔑 Change Password
            </Text>
            <TextInput
              style={[
                styles.modalinput,
                {
                  backgroundColor: isDarkMode ? "#2e3440" : "#f1f1f1", // Background color
                  color: isDarkMode ? "#eceff4" : "#2e3440", // Text color
                },
              ]}
              placeholder="Old Password"
              secureTextEntry
              value={oldPassword}
              onChangeText={(text) =>
                setUserData((prevState) => ({
                  ...prevState,
                  oldPassword: text,
                }))
              }
              placeholderTextColor={isDarkMode ? "#999" : "#666"} // Placeholder text color
            />
            <TextInput
              style={[
                styles.modalinput,
                {
                  backgroundColor: isDarkMode ? "#2e3440" : "#f1f1f1", // Background color
                  color: isDarkMode ? "#eceff4" : "#2e3440", // Text color
                },
              ]}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={(text) =>
                setUserData((prevState) => ({
                  ...prevState,
                  newPassword: text,
                }))
              }
              placeholderTextColor={isDarkMode ? "#999" : "#666"} // Placeholder text color
            />
            <TextInput
              style={[
                styles.modalinput,
                {
                  backgroundColor: isDarkMode ? "#2e3440" : "#f1f1f1", // Background color
                  color: isDarkMode ? "#eceff4" : "#2e3440", // Text color
                },
              ]}
              placeholder="Confirm New Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) =>
                setUserData((prevState) => ({
                  ...prevState,
                  confirmPassword: text,
                }))
              }
              placeholderTextColor={isDarkMode ? "#999" : "#666"} // Placeholder text color
            />

            {passwordError && (
              <Text style={styles.errorText}>{passwordError}</Text>
            )}
            <RoundedButton
              title="Save Password"
              onPress={handlePasswordChange}
              style={{
                backgroundColor: isDarkMode ? "#5e81ac" : "#1e88e5",
                color: isDarkMode ? "#eceff4" : "#2e3440",
                width: "100%",
              }}
            />
            <RoundedButton
              title="Cancel"
              onPress={togglePasswordModal}
              style={{ backgroundColor: "#888888", width: "100%" }}
            />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={usernameModalVisible} // Modal visibility controlled by state
        onRequestClose={toggleUsernameModal} // Close modal when user taps outside
      >
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDarkMode ? "#2e3440" : "#fff" },
            ]}
          >
            <Text
              style={[
                styles.title,
                { color: isDarkMode ? "#eceff4" : "#2e3440" },
              ]}
            >
              🖊 Edit Username
            </Text>
            <TextInput
              style={[
                styles.modalinput,
                {
                  backgroundColor: isDarkMode ? "#2e3440" : "#f1f1f1", // Background color
                  color: isDarkMode ? "#eceff4" : "#2e3440", // Text color
                },
              ]}
              placeholder="New Username"
              value={newUsername}
              onChangeText={(text) =>
                setUserData((prevState) => ({
                  ...prevState,
                  newUsername: text,
                }))
              }
              placeholderTextColor={isDarkMode ? "#999" : "#666"} // Placeholder text color
            />

            <RoundedButton
              title="Save Username"
              onPress={handleSaveUsername} // Save username when pressed
              style={{
                backgroundColor: isDarkMode ? "#5e81ac" : "#1e88e5",
                width: "100%",
              }}
            />
            <RoundedButton
              title="Cancel"
              onPress={toggleUsernameModal} // Closes modal without saving
              style={{ backgroundColor: "#888888", width: "100%" }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 20,
    marginTop: 20,
    backgroundColor: "#ffffff00",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
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
    transition: "background-color 0.3s ease",
  },
  themeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    transition: "background-color 0.3s ease",
    position: "absolute",
    right: 0,
    top: 0,
    margin: 20,
  },

  toggleText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "600",
  },
  userInfoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  userInfoText: {
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    fontSize: 22,
    fontWeight: "600",
    width: "100%",
    height: 50,
    borderColor: "#ccccc000",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0)",
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
  },
  modalinput: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 8,
    width: "100%",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  link: {
    color: "#007bff",
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#ff4d4d",
  },
  modalBackground: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  modalContent: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    gap: 10,
    borderRadius: 10,
    width: "80%",
  },
  statsContainer: {
    marginVertical: 20,
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
    flexWrap: "wrap",
    gap: 10,
  },
  statsText: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 5,
    justifyContent: "center",
    fontSize: 14,
  },
});
