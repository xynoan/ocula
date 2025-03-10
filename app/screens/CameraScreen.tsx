import { Text, StyleSheet, View } from "react-native";

export default function CameraScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.screenText}>Camera UI</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    screenText: { fontSize: 24, fontWeight: "bold", color: "#333" },
});
