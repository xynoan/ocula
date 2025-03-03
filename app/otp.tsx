import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Button, Alert } from "react-native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter, useLocalSearchParams } from "expo-router";
import app from "../firebaseConfig";
import { IPV4_ADDRESS } from '@env';

export default function Index() {
    const router = useRouter();
    const { email, password } = useLocalSearchParams();
    const [otp, setOtp] = useState("");
    const userEmail = Array.isArray(email) ? email[0] : email;
    const userPassword = Array.isArray(password) ? password[0] : password;

    const verifyOtp = async () => {
        if (!email) {
            Alert.alert("Error", "No email found. Try again.");
            return;
        }

        try {
            const response = await fetch(`http://${IPV4_ADDRESS}:5000/verify-otp`, { // your ipv4 address
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();
            console.log("Verification Response:", data);

            if (data.success) {
                const auth = getAuth(app);

                if (!email || Array.isArray(email)) {
                    Alert.alert("Error", "Invalid email format");
                    return;
                }

                if (!password || Array.isArray(password)) {
                    Alert.alert("Error", "Invalid password format");
                    return;
                }

                await createUserWithEmailAndPassword(auth, userEmail, userPassword);
                Alert.alert("Success", "Account created!");
                router.push("/login");
            } else {
                Alert.alert("Error", "Invalid OTP.");
            }
        } catch (error) {
            Alert.alert("Error", "Network error. Try again.");
        }
    };
    return (
        <View style={styles.container}>
            <View style={styles.otpContainer}>
                <Text style={[styles.otpContainer__headerText, styles.centerText, styles.text]}>We’ve sent OTP Code</Text>
                <Text style={[styles.text, styles.centerText]}>Enter the 6 digit verification code that was sent to your email.</Text>
                <Text style={{ color: "#1c4695", marginBottom: 10, fontWeight: "bold" }}>Enter 6-digit Code</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit code"
                    keyboardType="number-pad"
                    maxLength={6}
                    onChangeText={setOtp}
                    value={otp}
                />
                <View style={styles.buttonContainer}>
                    <Button title="Submit" color="#1c4695" onPress={verifyOtp} />
                </View>
                <Text style={styles.text}>OTP not received? <Text style={{ textDecorationLine: "underline" }}>Send Again</Text></Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#d2fff9",
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#8ad6cc",
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 18,
        textAlign: "center",
    },
    otpContainer: {
        backgroundColor: "#ffffff",
        borderRadius: 15,
        padding: 30,
        width: "80%"
    },
    otpContainer__headerText: {
        fontWeight: "bold",
        fontSize: 20,
    },
    buttonContainer: {
        marginTop: 16,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 12
    },
    // reusable class
    centerText: {
        textAlign: "center",
    },
    text: {
        color: "#1c4695",
        marginBottom: 10
    },
})