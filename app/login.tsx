import React, { useState } from "react";
import { View, Text, StyleSheet, StatusBar, Button, TextInput } from "react-native";
import RadioGroup from "react-native-radio-buttons-group";

export default function Index() {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const radioButtons = [
    { id: "yes", label: "Remember Me", value: "remember" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#d2fff9" barStyle="dark-content" />

      <View style={styles.loginBox}>
        <View style={styles.loginBox__header}>
          <Text style={styles.headerText}>NEW USER HERE</Text>
        </View>
        <View style={styles.loginBox__content}>
          <Text style={styles.loginBox__content__accountText}>Do not have an account yet?</Text>
          <View style={styles.buttonContainer}>
            <Button title="Let's go!" color="#1c4695" />
          </View>
        </View>
      </View>

      <View style={styles.loginBox}>
        <View style={styles.loginBox__header}>
          <Text style={styles.headerText}>CIRCLE</Text>
        </View>
        <View style={styles.loginBox__content}>
          <TextInput style={styles.textInput} placeholder="Email" placeholderTextColor="#1c4695" />
          <TextInput style={styles.textInput} placeholder="Password" placeholderTextColor="#1c4695" secureTextEntry={true} />

          <View style={styles.radioContainer}>
            <RadioGroup
              radioButtons={radioButtons}
              onPress={(id) => setSelectedId(id)}
              selectedId={selectedId ?? undefined}
            />
          </View>

          <Text style={{ textDecorationLine: "underline" }}>Forgot Password?</Text>
          <View style={styles.buttonContainer}>
            <Button title="Log in" color="#1c4695" />
          </View>
        </View>
      </View>
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
  loginBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "80%",
    maxWidth: 400,
    overflow: "hidden",
    marginBottom: 20,
  },
  loginBox__header: {
    backgroundColor: "#8ad6cc",
    padding: 16,
    alignItems: "center",
  },
  loginBox__content: {
    padding: 24,
  },
  loginBox__content__accountText: {
    color: "#2c457e",
    textAlign: "center",
  },
  headerText: {
    color: "#effbfe",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContainer: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#8ad6cc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    width: "100%",
  },
  radioContainer: {
    marginLeft: -10,
    marginTop: 10,
    marginBottom: 10,
    alignItems: "flex-start",
  },
});