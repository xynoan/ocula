// TODO: Implement "Remember Me" feature
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, StatusBar, Button, TextInput, Alert, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RadioGroup from "react-native-radio-buttons-group";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const radioButtons = [
    { id: "yes", label: "Remember Me", value: "remember" },
  ];

  useEffect(() => {
    const checkRememberedUser = async () => {
      const savedEmail = await AsyncStorage.getItem("email");
      const savedPassword = await AsyncStorage.getItem("password");

      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        autoLogin(savedEmail, savedPassword);
      }
    };
    checkRememberedUser();
  }, []);

  const autoLogin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch (error) {
      console.log("Auto-login failed:", error);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Login Successful!");

      if (selectedId === "yes") {
        await AsyncStorage.setItem("email", email);
        await AsyncStorage.setItem("password", password);
      } else {
        await AsyncStorage.removeItem("email");
        await AsyncStorage.removeItem("password");
      }
      router.push("/home");
    } catch (error) {
      Alert.alert("Oops!", "Invalid email or password. Please try again.");
    }
  };

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
            <Button title="Let's go!" color="#1c4695" onPress={() => router.push("/register")} />
          </View>
        </View>
      </View>

      <View style={styles.loginBox}>
        <View style={styles.loginBox__header}>
          <Text style={styles.headerText}>CIRCLE</Text>
        </View>
        <View style={styles.loginBox__content}>
          <TextInput
            style={styles.textInput}
            placeholder="Email"
            placeholderTextColor="#1c4695"
            value={email}
            onChangeText={setEmail}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              placeholderTextColor="#1c4695"
              secureTextEntry={!isPasswordVisible}
              onChangeText={setPassword}
              value={password}
            />
            {password.length > 0 && (
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-off" : "eye"}
                  size={24}
                  color="#1c4695"
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.radioContainer}>
            <RadioGroup
              radioButtons={radioButtons}
              onPress={(id) => setSelectedId(id)}
              selectedId={selectedId ?? undefined}
            />
          </View>

          <Text style={{ textDecorationLine: "underline" }} onPress={() => router.push("/forgotPassword")}>Forgot Password?</Text>
          <View style={styles.buttonContainer}>
            <Button title="Log in" color="#1c4695" onPress={handleLogin} />
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative"
  },
  eyeIcon: {
    right: 20,
    bottom: 22,
    position: "absolute"
  },
});