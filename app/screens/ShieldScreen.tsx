import { View, Text, StyleSheet, Switch, TouchableOpacity, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useRef } from "react";
import { Camera, CameraType, useCameraPermissions, CameraView } from "expo-camera";

export default function ShieldScreen() {
    const [isEntranceEnabled, setIsEntranceEnabled] = useState(true);
    const [isEntityEnabled, setIsEntityEnabled] = useState(true);
    const [permission, requestPermission] = useCameraPermissions();
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraType, setCameraType] = useState<CameraType>('front');
    const [registeredFaces, setRegisteredFaces] = useState<string[]>([]);
    const cameraRef = useRef<CameraView>(null);

    // Toggle Functions
    const toggleEntrance = () => setIsEntranceEnabled((prev) => !prev);
    const toggleEntity = () => setIsEntityEnabled((prev) => !prev);

    // Handle Camera Access
    const handleCameraAccess = async () => {
        if (!permission?.granted) {
            await requestPermission();
        }
        setIsCameraActive(true);
    };

    // Capture Image and Register Face
    const captureFace = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                setRegisteredFaces((prevFaces) => [...prevFaces, photo?.uri || '']);
                Alert.alert("Success", "Face registered successfully!");
                setIsCameraActive(false);
            } catch (error) {
                Alert.alert("Error", "Failed to capture face.");
                console.error(error);
            }
        }
    };

    // Toggle Camera Type (Front/Back)
    const switchCamera = () => {
        setCameraType((prevType) => (prevType === 'back' ? 'front' : 'back'));
    };

    return (
        <View style={styles.securityContainer}>
            {/* Face Registration */}
            <View style={styles.faceContainer}>
                <View style={styles.faceHeader}>
                    <Ionicons name="person" size={40} color="#5b7084" />
                    <View style={{ alignItems: "flex-start" }}>
                        <Text style={styles.faceTitle}>Registered Faces</Text>
                        <View style={styles.faceList}>
                            {registeredFaces.length === 0 ? (
                                <Text style={{ color: "#5b7084" }}>No faces registered</Text>
                            ) : (
                                registeredFaces.map((uri, index) => (
                                    <Image key={index} source={{ uri }} style={styles.faceImage} />
                                ))
                            )}
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.registerButton} onPress={handleCameraAccess}>
                    <Ionicons name="add-outline" size={40} color="#fff" />
                    <Text style={styles.registerText}>Register New Face</Text>
                </TouchableOpacity>
            </View>

            {/* Logs Section */}
            <View style={styles.logsContainer}>
                <Ionicons name="clipboard-outline" size={40} color="#5b7084" />
                <Text style={styles.logsTitle}>Logs</Text>
                <Ionicons name="arrow-forward-circle" size={40} color="#5b7084" />
            </View>

            {/* Notification Toggles */}
            <View style={styles.notificationContainer}>
                <Ionicons name="people" size={40} color="#5b7084" />
                <Text style={styles.notificationText}>Circle Entrance Notification</Text>
                <Switch
                    trackColor={{ false: "#ccc", true: "#2196F3" }}
                    thumbColor={isEntranceEnabled ? "#fff" : "#f4f3f4"}
                    onValueChange={toggleEntrance}
                    value={isEntranceEnabled}
                />
            </View>

            <View style={styles.notificationContainer}>
                <Ionicons name="notifications" size={40} color="#5b7084" />
                <Text style={styles.notificationText}>Unknown Entity Alert</Text>
                <Switch
                    trackColor={{ false: "#ccc", true: "#2196F3" }}
                    thumbColor={isEntityEnabled ? "#fff" : "#f4f3f4"}
                    onValueChange={toggleEntity}
                    value={isEntityEnabled}
                />
            </View>

            {/* Camera Preview */}
            {isCameraActive && permission?.granted && (
                <View style={styles.cameraContainer}>
                    <CameraView ref={cameraRef} style={styles.camera} facing={cameraType}>
                        <View style={styles.cameraControls}>
                            <TouchableOpacity onPress={switchCamera}>
                                <Ionicons name="camera-reverse-outline" size={40} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={captureFace}>
                                <Ionicons name="camera-outline" size={40} color="green" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsCameraActive(false)}>
                                <Ionicons name="close-circle" size={40} color="red" />
                            </TouchableOpacity>
                        </View>
                    </CameraView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    securityContainer: { flex: 1, alignItems: "flex-start", gap: 15, width: 300, marginTop: 15 },
    faceContainer: { alignItems: "flex-start", backgroundColor: "#ededf5", borderRadius: 20, overflow: "hidden", width: "100%" },
    faceHeader: { flexDirection: "row", alignItems: "center", padding: 10, gap: 10 },
    faceTitle: { fontSize: 16, fontWeight: "bold", color: "#243483" },
    faceList: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
    faceImage: { width: 30, height: 30, borderRadius: 25, borderWidth: 2, borderColor: "#243483" },
    registerButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#243483", padding: 10, width: "100%" },
    registerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    logsContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", backgroundColor: "#ededf5", width: "100%", padding: 10, borderRadius: 20 },
    logsTitle: { fontSize: 16, fontWeight: "bold", color: "#243483" },
    notificationContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", backgroundColor: "#ededf5", width: "100%", borderRadius: 20, padding: 10 },
    notificationText: { fontSize: 16, fontWeight: "bold", color: "#243483" },
    cameraContainer: { flex: 1, width: "100%", height: 300, borderRadius: 20, overflow: "hidden" },
    camera: { flex: 1, justifyContent: "flex-end" },
    cameraControls: { flexDirection: "row", justifyContent: "space-between", padding: 20, backgroundColor: "rgba(0,0,0,0.5)" },
});
