import { Text, StyleSheet } from "react-native";

export default function CameraScreen() {
    return <Text style={styles.screenText}>Camera UI</Text>;
}

const styles = StyleSheet.create({
    screenText: { fontSize: 24, fontWeight: "bold", color: "#333" },
});
