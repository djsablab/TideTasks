/* -------------------- Imports -------------------- */
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Pressable,
  Text,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRef, useState } from "react";
import { ONBOARDING_PAGES } from "./config";
import { ONBOARDING_VERSION } from "../../constants/onboarding";
import RoundedButton from "../../components/RoundedButton";

const { width } = Dimensions.get("window");

/* -------------------- Render -------------------- */
export default function OnboardingScreen({ onDone }) {
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);

  /* -------------------- Functions -------------------- */
  const completeOnboarding = async () => {
    await AsyncStorage.setItem("onboardingVersion", ONBOARDING_VERSION);
    onDone();
  };

  const next = () => {
    if (index < ONBOARDING_PAGES.length - 1) {
      listRef.current.scrollToIndex({ index: index + 1 });
    } else {
      completeOnboarding();
    }
  };

  const back = () => {
    if (index > 0) {
      listRef.current.scrollToIndex({ index: index - 1 });
    }
  };

  /* -------------------- Main UI -------------------- */
  return (
    <View style={styles.container}>
      {/* Skip */}
      <Pressable style={styles.skip} onPress={completeOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      {/* Pages */}
      <FlatList
        ref={listRef}
        data={ONBOARDING_PAGES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        renderItem={({ item }) => (
          <View style={{ width }}>{item.render()}</View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {ONBOARDING_PAGES.map((_, i) => (
          <View key={i} style={[styles.dot, index === i && styles.activeDot]} />
        ))}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {index > 0 && (
          <RoundedButton
            title="Back"
            onPress={back}
            style={[
              styles.primaryBtn,
              {
                backgroundColor: "#0000",
                paddingHorizontal: 28,
                paddingVertical: 12,
              },
            ]}
            textStyle={{ fontSize: 16, color: "#555" }}
          />
        )}
        <RoundedButton
          actOpacity={0}
          style={[styles.primaryBtn, { opacity: 0 }]}
          textStyle={styles.primaryText}
        ></RoundedButton>

        <RoundedButton
          title={index === ONBOARDING_PAGES.length - 1 ? "Get Started" : "Next"}
          onPress={next}
          style={styles.primaryBtn}
          textStyle={styles.primaryText}
        ></RoundedButton>
      </View>
    </View>
  );
}

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  skip: { position: "absolute", top: 50, right: 20, zIndex: 10 },
  skipText: { color: "#666", fontSize: 14 },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: "#ccc",
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 12,
    backgroundColor: "#4A90E2",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 24,
    marginBottom: 30,
  },
  controlText: { fontSize: 16, color: "#555", marginTop: 12 },
  primaryBtn: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginBottom: 24,
  },
  primaryText: { color: "#fff", fontSize: 16 },
});
