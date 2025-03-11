import { View, Text, StyleSheet, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";

export default function ShieldScreen() {
    const [isEntranceEnabled, setIsEntranceEnabled] = useState(true);
    const [isEntityEnabled, setIsEntityEnabled] = useState(true);

    const toggleEntrance = () => setIsEntranceEnabled((previousState) => !previousState);
    const toggleEntity = () => setIsEntityEnabled((previousState) => !previousState);

    return (
        <View style={styles.securityContainer}>
            <View style={styles.faceContainer}>
                <View style={{ flexDirection: "row", alignItems: "center", padding: 10, gap: 10}}>
                    <Ionicons name="person" size={40} color="#5b7084" />
                    <View style={{ alignItems: "flex-start" }}>
                        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#243483" }}>Circle Faces</Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", width: "98%" }}>
                            <Ionicons name="person-circle-outline" size={30} color="#5b7084" />
                            <Ionicons name="person-circle-outline" size={30} color="#5b7084" />
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#243483", padding: 10, width: "100%" }}>
                    <Ionicons name="add-outline" size={40} color="#fff" />
                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Register New Face</Text>
                </View>
            </View>
            <View style={styles.logsContainer}>
                <Ionicons name="clipboard-outline" size={40} color="#5b7084" />
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#243483" }}>Logs</Text>
                <Ionicons name="arrow-forward-circle" size={40} color="#5b7084" />
            </View>
            <View style={styles.notificationContainer}>
                <Ionicons name="people" size={40} color="#5b7084" />
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#243483" }}>Circle Entrance Notification</Text>
                <Switch
                    trackColor={{ false: "#ccc", true: "#2196F3" }}
                    thumbColor={isEntranceEnabled ? "#fff" : "#f4f3f4"}
                    ios_backgroundColor="#ccc"
                    onValueChange={toggleEntrance}
                    value={isEntranceEnabled}
                />
            </View>
            <View style={styles.notificationContainer}>
                <Ionicons name="notifications" size={40} color="#5b7084" />
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#243483" }}>Unknown Entity Alert</Text>
                <Switch
                    trackColor={{ false: "#ccc", true: "#2196F3" }}
                    thumbColor={isEntityEnabled ? "#fff" : "#f4f3f4"}
                    ios_backgroundColor="#ccc"
                    onValueChange={toggleEntity}
                    value={isEntityEnabled}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    securityContainer: { flex: 1, alignItems: "flex-start", gap: 15, width: 300, marginTop: 15 },
    faceContainer: { alignItems: "flex-start", backgroundColor: "#ededf5", borderRadius: 20, overflow: "hidden", width: "100%" },
    logsContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", backgroundColor: "#ededf5", width: "100%", padding: 10, borderRadius: 20 },
    notificationContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", backgroundColor: "#ededf5", width: "100%", borderRadius: 20, padding: 10 },
});
