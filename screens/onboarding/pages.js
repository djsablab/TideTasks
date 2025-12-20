/* -------------------- Imports -------------------- */
import { View, Text, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

/* -------------------- Main UIs -------------------- */
export const IntroPage = () => (
  <View style={styles.page}>
    <LottieView
      source={require("../../assets/lottie/welcome.json")}
      autoPlay
      loop
      style={styles.lottie}
    />
    <Text style={styles.title}>✨ Welcome to TideTasks</Text>
    <Text style={styles.text}>
      The ultimate task management app to boost your productivity and keep your
      tasks organized.
    </Text>
  </View>
);

export const CapabilitiesPage = () => (
  <View style={styles.page}>
    <Text style={styles.title}>✨ More Features ✨</Text>
    <Text style={styles.text}>
      🚀 TideTasks offers powerful control on their tasks while having strong
      backend support by Firebase.{"\n"}
      {"\n"}🔑 TideTasks matters user security and privacy, thus all data is
      securely stored in Firestore under each user's account.{"\n"}
      {"\n"}📱 Access your tasks from any mobile device, anytime, anywhere with
      TideTasks' sleek and intuitive design.
    </Text>
  </View>
);

export const FeaturesPage = () => (
  <View style={styles.page}>
    <Text style={styles.title}>✨ Stay tuned to the updates!</Text>
    <Text style={styles.text}>
      🌊 TideTasks is 2 weeks old and we are constantly working on adding new
      features and improvements.{"\n"}
      {"\n"}🚀 Upcoming features include task reminders, priority levels, and
      other amazing features will be added in the future, so stay tuned! {"\n"}
      {"\n"}🌟 We value your feedback! Feel free to reach out with any
      suggestions or ideas to help us make TideTasks even better.
    </Text>
  </View>
);

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  lottie: {
    width: 250,
    height: 125,
    marginBottom: 24,
  },
  title: {
    paddingBottom: 6,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    borderStyle: "dashed",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    lineHeight: 20,
  },
});
