import { View, Text, StyleSheet, TextInput, Button } from "react-native";

export default function Index() {
    return (
        <View style={styles.container}>
            <View style={styles.otpContainer}>
                <Text style={[styles.otpContainer__headerText, styles.centerText, styles.text]}>We’ve sent OTP Code</Text>
                <Text style={[styles.text, styles.centerText]}>Enter the 6 digit verification code that was sent to your email.</Text>
                <Text style={{ color: "#1c4695", marginBottom: 10, fontWeight: "bold" }}>Enter 6-digit Recovery Code</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit code"
                    keyboardType="number-pad"
                    maxLength={6}
                />
                <View style={styles.buttonContainer}>
                    <Button title="Submit" color="#1c4695"/>
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