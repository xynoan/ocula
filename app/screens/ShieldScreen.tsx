import { View, Text, StyleSheet } from "react-native";
import { ScreenContainer } from "react-native-screens";

export default function ShieldScreen() {
    return (
        <View style={styles.securityContainer}>
            <Text style={styles.sectionTitle}>Registered Faces UI</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    securityContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    sectionTitle: { fontSize: 20, fontWeight: "bold", marginTop: 10 }
});
