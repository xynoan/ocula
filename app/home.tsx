import { View, Text, StyleSheet } from "react-native";

export default function Index() {
    return (
        <View style={styles.container}>
            <Text>ESP32-CAM time</Text>
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
})