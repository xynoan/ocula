import React from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#d2fff9" barStyle="dark-content" />
      <Text style={styles.text}>LOGIN TIME!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#d2fff9", 
  },
  text: { fontSize: 24, fontWeight: "bold" },
});
