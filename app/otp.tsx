import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Button, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter, useLocalSearchParams } from "expo-router";
import app from "../firebaseConfig";

export default function Index() {
    const router = useRouter();
    const { email, password } = useLocalSearchParams();
    const [otp, setOtp] = useState("");
    const userEmail = Array.isArray(email) ? email[0] : email;
    const userPassword = Array.isArray(password) ? password[0] : password;
    const [resendDisabled, setResendDisabled] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendDisabled && resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else if (resendTimer === 0) {
            setResendDisabled(false);
            setResendTimer(30);
        }
        return () => clearInterval(timer);
    }, [resendDisabled, resendTimer]);

    const verifyOtp = async () => {
        if (!email) {
            Alert.alert("Error", "No email found. Try again.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`https://mobile-app-ah8n.onrender.com/verify-otp`, { 
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

                const userCredential = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
                Alert.alert(
                    "Account Created",
                    "Let's set up your profile!",
                    [
                        {
                            text: "OK",
                            onPress: () => router.push("/profile-setup")
                        }
                    ]
                );
            } else {
                Alert.alert("Error", "Invalid OTP.");
            }
        } catch (error) {
            Alert.alert("Error", "Network error. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        try {
            setResendDisabled(true);

            const response = await fetch(`https://mobile-app-ah8n.onrender.com/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail }),
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert("Success", "OTP has been resent.");
            } else {
                Alert.alert("Error", "Failed to resend OTP.");
                setResendDisabled(false);
            }
        } catch (error) {
            Alert.alert("Error", "Network error. Try again.");
            setResendDisabled(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.otpContainer}>
                <Text style={[styles.otpContainer__headerText, styles.centerText, styles.text]}>We've sent OTP Code</Text>
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
                    <TouchableOpacity 
                        style={[styles.submitButton, loading && styles.buttonDisabled]}
                        onPress={verifyOtp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Submit</Text>
                        )}
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    onPress={resendOtp}
                    disabled={resendDisabled}
                >
                    <Text style={[styles.text, resendDisabled && { color: "gray" }]}>
                        OTP not received?{" "}
                        <Text style={{ textDecorationLine: "underline" }}>
                            {resendDisabled ? `Sent (${resendTimer}s)` : "Send Again"}
                        </Text>
                    </Text>
                </TouchableOpacity>
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
    submitButton: {
        backgroundColor: "#1c4695",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
})