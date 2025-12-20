/* -------------------- Imports -------------------- */
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
} from "react-native";

import { Swipeable } from "react-native-gesture-handler";
import DateTimePicker from "@react-native-community/datetimepicker";
import Modal from "react-native-modal";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  doc,
} from "firebase/firestore";

/* -------------------- HomeScreen -------------------- */
export default function HomeScreen({ isDarkMode, setShowNavBar }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [completed, setCompleted] = useState(false);
  const uid = auth.currentUser?.uid;

  const scrollY = useRef(new Animated.Value(0)).current;
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  /* -------------------- Track scroll position to hide/show the navigation bar -------------------- */
  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      if (value > 1) {
        setShowNavBar(false); // Hide navbar when scrolled down
      } else {
        setShowNavBar(true); // Show navbar when scrolled up
      }
    });

    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [scrollY, setShowNavBar]);

  useEffect(() => {
    if (selectedDate && filteredTasks.length === 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [selectedDate, filteredTasks]);

  /* -------------------- Load tasks from Firestore -------------------- */
  useEffect(() => {
    if (!uid) return;
    const ref = collection(db, "users", uid, "tasks");
    const unsub = onSnapshot(ref, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        animation: new Animated.Value(d.data().completed ? 1 : 0),
      }));
      setTasks(list);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  /* -------------------- Filter tasks based on selected date -------------------- */
  useEffect(() => {
    let list = [...tasks];
    if (selectedDate) {
      list = list.filter((t) => {
        const start = new Date(t.startDate);
        const end = new Date(t.endDate);
        const clicked = new Date(selectedDate);
        return clicked >= start && clicked <= end;
      });
    }
    list.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    setFilteredTasks(list);
  }, [selectedDate, tasks]);

  /* -------------------- Save task to Firestore -------------------- */
  const saveTask = async () => {
    if (!taskName.trim()) return alert("Task name required.");

    const data = {
      name: taskName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      completed: completed,
    };

    if (editingTask) {
      await updateDoc(doc(db, "users", uid, "tasks", editingTask.id), data);
    } else {
      await addDoc(collection(db, "users", uid, "tasks"), data);
    }

    closeModal();
  };

  const closeModal = () => {
    setTaskName("");
    setStartDate(new Date());
    setEndDate(new Date());
    setEditingTask(null);
    setCompleted(false);
    setModalVisible(false);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTaskName(task.name);
    setStartDate(new Date(task.startDate));
    setEndDate(new Date(task.endDate));
    setCompleted(task.completed || false);
    setModalVisible(true);
  };

  /* -------------------- Delete task -------------------- */
  const deleteTask = async (id) => {
    await deleteDoc(doc(db, "users", uid, "tasks", id));
  };
  /* -------------------- Toggle task completion -------------------- */
  const toggleCompleted = async (task) => {
    const newValue = !task.completed;
    await updateDoc(doc(db, "users", uid, "tasks", task.id), {
      completed: newValue,
    });

    Animated.timing(task.animation, {
      toValue: newValue ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  /* -------------------- Prepare marked dates for Calendar -------------------- */
  const markedDates = {};
  tasks.forEach((t) => {
    const start = new Date(t.startDate);
    const end = new Date(t.endDate);
    let cursor = new Date(start);
    while (cursor <= end) {
      const key = cursor.toISOString().split("T")[0];
      markedDates[key] = {
        marked: true,
        dotColor: t.completed ? "#4caf50" : "#4A90E2",
      };
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  /* -------------------- Prepare selected date for Calendar -------------------- */
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: isDarkMode ? "#5e81ac" : "#1e88e5",
    };
  }

  /* -------------------- Render each task item -------------------- */
  const renderTask = ({ item }) => {
    const renderRightActions = () => (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTask(item.id)}
      >
        <Ionicons name="trash" size={24} color="#fff" />
      </TouchableOpacity>
    );

    const checkboxColor = item.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", "#4A90E2"],
    });

    /* -------------------- Calendar UI -------------------- */
    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <Animated.ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
          <View
            style={[
              styles.taskCard,
              {
                backgroundColor: isDarkMode ? "#2b2e33" : "#fff",
                shadowOpacity: isDarkMode ? 0 : 0.15,
                shadowRadius: isDarkMode ? 0 : 5,
                shadowOffset: { width: 0, height: 3 },
                elevation: isDarkMode ? 0 : 3,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.checkbox, { borderColor: "#4A90E2" }]}
              onPress={() => toggleCompleted(item)}
            >
              <Animated.View
                style={[
                  styles.checkboxFill,
                  { backgroundColor: checkboxColor },
                ]}
              >
                {item.completed && (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                )}
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1, marginLeft: 12 }}
              onPress={() => openEditModal(item)}
            >
              <Text
                style={[
                  styles.taskName,
                  {
                    color: isDarkMode ? "#fff" : "#111",
                    textDecorationLine: item.completed
                      ? "line-through"
                      : "none",
                    opacity: item.completed ? 0.6 : 1,
                  },
                ]}
              >
                {item.name}
              </Text>
              <Text
                style={[
                  styles.taskDates,
                  { color: isDarkMode ? "#ddd" : "#555" },
                ]}
              >
                {new Date(item.startDate).toDateString()} →{" "}
                {new Date(item.endDate).toDateString()}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>
      </Swipeable>
    );
  };

  /* -------------------- Main UI -------------------- */
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#16191dff" : "#ffffff" },
      ]}
    >
      <Calendar
        key={isDarkMode ? "dark" : "light"}
        markedDates={markedDates}
        onDayPress={(day) => {
          setSelectedDate((prev) =>
            prev === day.dateString ? null : day.dateString
          );
        }}
        theme={{
          calendarBackground: isDarkMode ? "#1b1e23" : "#ffffff",
          dayTextColor: isDarkMode ? "#eceff4" : "#2e3440",
          monthTextColor: isDarkMode ? "#eceff4" : "#2e3440",
          textDisabledColor: isDarkMode ? "#4c566a" : "#d1d1d1",
          todayTextColor: isDarkMode ? "#5e81ac" : "#1e88e5",
          todayBackgroundColor: isDarkMode ? "#2e3440" : "#e5f2ff",
          selectedDayTextColor: "#fff",
          textSectionTitleColor: isDarkMode ? "#d8dee9" : "#444",
          arrowColor: isDarkMode ? "#81a1c1" : "#1e88e5",
          arrowStyle: { margin: 10 },
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
        style={styles.calendar}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#4A90E2" />
      ) : filteredTasks.length === 0 && selectedDate ? (
        <Animated.View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            opacity: fadeAnim,
            marginBottom: 70,
          }}
        >
          <Text style={{ color: isDarkMode ? "#ddd" : "#555", fontSize: 16 }}>
            No task found
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          contentContainerStyle={{ paddingBottom: 100, width: "100%" }}
          onScroll={handleScroll} // Add scroll event here
          scrollEventThrottle={16} // Throttle the scroll events for better performance
        />
      )}

      {/* Task Modal */}
      <Modal isVisible={modalVisible} onBackdropPress={closeModal}>
        <View
          style={[
            styles.modal,
            { backgroundColor: isDarkMode ? "#2c2f35" : "#fff" },
          ]}
        >
          <Text
            style={[styles.modalTitle, { color: isDarkMode ? "#fff" : "#000" }]}
          >
            {editingTask ? "Edit Task" : "Add Task"}
          </Text>

          <TextInput
            placeholder="Task Name"
            placeholderTextColor="#777"
            style={[
              styles.input,
              {
                color: isDarkMode ? "#fff" : "#000",
                borderColor: isDarkMode ? "#444" : "#ccc",
              },
            ]}
            value={taskName}
            onChangeText={setTaskName}
          />

          {/* Completed Checkbox in Modal */}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              flexWrap: "wrap",
            }}
            onPress={() => setCompleted(!completed)}
            activeOpacity={0.8}
          >
            <TouchableOpacity
              style={[
                styles.checkbox,
                {
                  backgroundColor: completed ? "#4A90E2" : "transparent",
                  borderColor: "#4A90E2",
                  marginBottom: 0,
                  alignItems: "center",
                  paddingHorizontal: 0,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => setCompleted(!completed)}
            >
              {completed && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </TouchableOpacity>
            <Text
              style={{
                color: isDarkMode ? "#fff" : "#000",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              Mark as Completed
            </Text>
          </TouchableOpacity>

          {/* Start Date Selector */}

          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            style={[
              styles.dateBtn,
              { flexDirection: "row", alignItems: "center", gap: 8 },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={isDarkMode ? "#5e81ac" : "#1e88e5"}
            />
            <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>
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

          {/* End Date Selector */}
          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            style={[
              styles.dateBtn,
              { flexDirection: "row", alignItems: "center", gap: 8 },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={isDarkMode ? "#5e81ac" : "#1e88e5"}
            />
            <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>
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

          <TouchableOpacity
            style={{
              backgroundColor: isDarkMode ? "#5e81ac" : "#1e88e5",
              padding: 8,
              borderRadius: 12,
            }}
            onPress={saveTask}
          >
            <Text style={styles.saveText}>
              {editingTask ? "Save Changes" : "Add Task"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    alignItems: "stretch",
    paddingHorizontal: 8,
  },
  calendar: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxFill: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 2,
  },
  taskName: {
    fontSize: 18,
    fontWeight: "600",
  },
  taskDates: {
    marginTop: 4,
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: "90%",
    marginTop: 5,
    borderRadius: 12,
  },
  modal: {
    padding: 20,
    borderRadius: 14,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  dateBtn: {
    paddingVertical: 10,
  },
  saveBtn: {
    backgroundColor: "#4A90E2",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  saveText: {
    textAlign: "center",
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  cancelBtn: {
    padding: 10,
    marginTop: 10,
  },
  cancelText: {
    textAlign: "center",
    color: "#999",
  },
});
