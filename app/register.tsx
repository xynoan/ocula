import { useState } from "react";
import { View, Text, StyleSheet, StatusBar, Button, TextInput, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getAuth, fetchSignInMethodsForEmail } from "firebase/auth";

export default function Index() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isOtpEnabled, setIsOtpEnabled] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const passwordCriteria = [
        { regex: /.{8,25}/, text: "At least 8-25 characters" },
        { regex: /[a-z]/, text: "At least 1 lowercase letter" },
        { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
        { regex: /\d/, text: "At least 1 number" },
        { regex: /[!@#$%^&*]/, text: "At least 1 special character (! @ # $ % ^ & *)" }
    ];

    const validateForm = async (inputEmail: string, inputPassword: string) => {
        setEmail(inputEmail);
        setPassword(inputPassword);
    
        const isEmailValid = emailRegex.test(inputEmail);
        const isPasswordValid = passwordCriteria.every(criteria => criteria.regex.test(inputPassword));
    
        setIsOtpEnabled(isEmailValid && isPasswordValid);
    };
    

    const sendOtp = async () => {
        try {
            const auth = getAuth();
            const signInMethods = await fetchSignInMethodsForEmail(auth, email);
            if (signInMethods.length > 0) {
                Alert.alert("Sorry!", "Email is already registered.");
                setEmail("");
                return;
            }
    
            const response = await fetch(`http://${process.env.IPV4_ADDRESS}:5000/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
    
            const data = await response.json();
            if (data.success) {
                Alert.alert("Success", "OTP has been sent to your email.");
                router.push({ pathname: "/otp", params: { email, password } });
            } else {
                Alert.alert("Error", "Failed to send OTP.");
            }
        } catch (error) {
            Alert.alert("Error", "Network error. Try again.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.registerContainer}>
                <StatusBar backgroundColor="#d2fff9" barStyle="dark-content" />
                <Text style={[styles.registerContainer__headerText, styles.centerText, styles.text]}>
                    Create your Account
                </Text>
                <Text style={[styles.text, styles.centerText]}>Create your online account</Text>

                <TextInput
                    style={styles.textInput}
                    placeholder="lan@gmail.com"
                    placeholderTextColor="#1c4695"
                    onChangeText={(text) => validateForm(text, password)}
                    value={email}
                />
                {!emailRegex.test(email) && email.length > 0 && (
                    <Text style={{ color: "red", marginBottom: 12 }}>Invalid email format</Text>
                )}

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Examplepassword#"
                        placeholderTextColor="#1c4695"
                        secureTextEntry={!isPasswordVisible}
                        onChangeText={(text) => validateForm(email, text)}
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

                <Text style={styles.text}>Password must contain</Text>
                {passwordCriteria.map((criteria, index) => {
                    const isValid = criteria.regex.test(password);
                    return (
                        <View key={index} style={styles.requirements}>
                            <Ionicons
                                name={isValid ? "checkmark-circle" : "close-circle"}
                                size={20}
                                color={isValid ? "green" : "red"}
                            />
                            <Text style={{ color: isValid ? "green" : "red" }}>{criteria.text}</Text>
                        </View>
                    );
                })}

                <View style={styles.buttonContainer}>
                    <Button title="Send OTP" color="#1c4695" disabled={!isOtpEnabled} onPress={sendOtp} />
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
    registerContainer: {
        backgroundColor: "#ffffff",
        borderRadius: 15,
        padding: 30,
        width: "80%"
    },
    registerContainer__headerText: {
        fontWeight: "bold",
        fontSize: 20,
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
    buttonContainer: {
        marginTop: 16,
        borderRadius: 12,
        overflow: "hidden",
    },
    requirements: {
        flexDirection: "row",
        gap: 5,
        alignItems: "center"
    },
    centerText: {
        textAlign: "center",
    },
    text: {
        color: "#1c4695",
        marginBottom: 10
    },
});
