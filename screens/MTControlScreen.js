import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

import { auth, db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AddTaskScreen({ isDarkMode }) {
  const [taskName, setTaskName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const uid = auth.currentUser?.uid;

  /** 🔥 Add Task to Firestore */
  const saveTask = async () => {
    if (!taskName.trim()) return alert("Task name cannot be empty.");
    if (!uid) return alert("User not authenticated.");

    await addDoc(collection(db, "users", uid, "tasks"), {
      name: taskName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    setTaskName("");
    setStartDate(new Date());
    setEndDate(new Date());
    alert("Task added successfully!");
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#16191d" : "#f6f6f6" },
      ]}
    >
      <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>
        Add New Task
      </Text>

      {/* Task Name */}
      <TextInput
        placeholder="Task name..."
        placeholderTextColor="#999"
        style={[
          styles.input,
          { color: isDarkMode ? "#fff" : "#000", borderColor: isDarkMode ? "#444" : "#ddd" },
        ]}
        value={taskName}
        onChangeText={setTaskName}
      />

      {/* Start Date */}
      <TouchableOpacity
        onPress={() => setShowStartPicker(true)}
        style={styles.dateBtn}
      >
        <Ionicons name="calendar" size={20} color={isDarkMode ? "#5e81ac" : "#1e88e5"} />
        <Text style={[styles.dateText, { color: isDarkMode ? "#fff" : "#000" }]}>
          Start: {startDate.toDateString()}
        </Text>
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          onChange={(e, d) => {
            setShowStartPicker(false);
            if (d) setStartDate(d);
          }}
        />
      )}

      {/* End Date */}
      <TouchableOpacity
        onPress={() => setShowEndPicker(true)}
        style={styles.dateBtn}
      >
        <Ionicons name="calendar" size={20} color={isDarkMode ? "#5e81ac" : "#1e88e5"} />
        <Text style={[styles.dateText, { color: isDarkMode ? "#fff" : "#000" }]}>
          End: {endDate.toDateString()}
        </Text>
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          onChange={(e, d) => {
            setShowEndPicker(false);
            if (d) setEndDate(d);
          }}
        />
      )}

      {/* Save Button */}
      <TouchableOpacity
        style={[
          styles.saveBtn,
          { backgroundColor: isDarkMode ? "#5e81ac" : "#1e88e5" },
        ]}
        onPress={saveTask}
      >
        <Text style={styles.saveText}>Add Task</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/** Styles */
const styles = StyleSheet.create({
  container: { paddingHorizontal: 10, paddingTop: 20, height: "85%" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 20, textAlign: "center", marginTop: 20 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20, flex: 1, textAlignVertical: "top" },
  dateBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 10, marginBottom: 2 },
  dateText: { marginLeft: 8, fontSize: 16 },
  saveBtn: { paddingVertical: 14, borderRadius: 10, marginTop: 30 },
  saveText: { textAlign: "center", fontSize: 18, fontWeight: "600", color: "#fff" },
});
