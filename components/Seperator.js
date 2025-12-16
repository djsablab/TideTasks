/* -------------------- Imports -------------------- */
import React from "react";
import { View, StyleSheet } from "react-native";

/* -------------------- Seperator Component -------------------- */
export default function Seperator(style) {
  return (
    <View
      style={[
        style.style,
        {
          width: "100%",
          height: StyleSheet.hairlineWidth,
          borderBottomColor: "#bbb",
          borderBottomWidth: StyleSheet.hairlineWidth,
          marginVertical: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 1,
          elevation: 1,
        },
      ]}
    />
  );
}
