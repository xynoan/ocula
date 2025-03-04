import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { useRouter } from "expo-router";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default function Index() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isContinueEnabled, setIsContinueEnabled] = useState(false);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateForm = async (inputEmail: string) => {
        setEmail(inputEmail);

        const isEmailValid = emailRegex.test(inputEmail);

        setIsContinueEnabled(isEmailValid);
    };

    const handleForgotPassword = async () => {
        const auth = getAuth();
        sendPasswordResetEmail(auth, email)
            .then(() => {
                Alert.alert("Success", "Password reset email sent! Check your inbox.");
                router.replace('/login');
            })
            .catch((error) => {
                if (error.code === "auth/user-not-found") {
                    Alert.alert("Error", "No account found with this email. Please check and try again.");
                    setEmail("");
                } else if (error.code === "auth/invalid-email") {
                    Alert.alert("Error", "Invalid email format. Please enter a valid email.");
                } else {
                    Alert.alert("Error", error.message);
                }
            });
    }

    return (
        <View style={styles.container}>
            <View style={styles.forgotPasswordContainer}>
                <Text style={[styles.forgotPasswordContainer__headerText, styles.centerText, styles.text]}>
                    Forgot Password
                </Text>
                <Text style={[styles.text, styles.centerText]}>Enter your email for the verification process, we will send the link to reset your password in your email.</Text>
                <Text style={styles.text}>Email</Text>
                <TextInput
                    style={styles.textInput}
                    placeholderTextColor="#1c4695"
                    value={email}
                    placeholder='example@gmail.com'
                    onChangeText={(text) => validateForm(text)}
                />
                {!emailRegex.test(email) && email.length > 0 && (
                    <Text style={{ color: "red" }}>Invalid email format</Text>
                )}
                <View style={styles.buttonContainer}>
                    <Button title="Continue" color="#1c4695" disabled={!isContinueEnabled} onPress={handleForgotPassword} />
                </View>
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
    textInput: {
        borderWidth: 1,
        borderColor: "#8ad6cc",
        padding: 12,
        borderRadius: 8,
        marginBottom: 2,
        fontSize: 16,
        width: "100%",
    },
    forgotPasswordContainer: {
        backgroundColor: "#ffffff",
        borderRadius: 15,
        padding: 30,
        width: "80%"
    },
    forgotPasswordContainer__headerText: {
        fontWeight: "bold",
        fontSize: 20,
    },
    buttonContainer: {
        marginTop: 16,
        borderRadius: 12,
        overflow: "hidden",
    },
    // reusable class/es
    centerText: {
        textAlign: "center",
    },
    text: {
        color: "#1c4695",
        marginBottom: 10
    },
})