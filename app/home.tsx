import { useState, useRef } from "react";
import { View, StyleSheet, Animated, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CameraScreen from "./screens/CameraScreen";
import ImagesScreen from "./screens/ImagesScreen";
import ShieldScreen from "./screens/ShieldScreen";
import ProfileScreen from "./screens/ProfileScreen";

export default function Index() {
    const [activeScreen, setActiveScreen] = useState<keyof typeof screens>("camera");
    const slideAnim = useRef(new Animated.Value(1000)).current;

    const screens = {
        camera: <CameraScreen />,
        images: <ImagesScreen />,
        shield: <ShieldScreen />,
        person: <ProfileScreen />,
    };

    const openScreen = (screen: keyof typeof screens) => {
        if (activeScreen === screen) {
            setActiveScreen("camera");
        } else {
            setActiveScreen(screen);
            slideAnim.setValue(1000);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.screenContainer, activeScreen === "camera" ? styles.cameraBackground : null]}>
                {screens[activeScreen]}
            </Animated.View>

            <View style={styles.bottomContainer}>
                <TouchableOpacity style={[styles.iconContainer, activeScreen === "camera" && styles.activeIcon]} onPress={() => setActiveScreen("camera")}>
                    <Ionicons name="camera" size={40} color="#fffeff" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.iconContainer, activeScreen === "images" && styles.activeIcon]} onPress={() => openScreen("images")}>
                    <Ionicons name="images" size={40} color="#fffeff" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.iconContainer, activeScreen === "shield" && styles.activeIcon]} onPress={() => openScreen("shield")}>
                    <Image style={{ height: 50, width: 40, tintColor: "#fffeff" }} source={require('../assets/images/shield.png')} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.iconContainer, activeScreen === "person" && styles.activeIcon]} onPress={() => openScreen("person")}>
                    <Ionicons name="person" size={40} color="#fffeff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", backgroundColor: "#fff" },
    screenContainer: { flex: 1, justifyContent: "center", alignItems: "center", width: "100%", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#d2fffa" },
    cameraBackground: { backgroundColor: "#ffffff" },
    bottomContainer: { position: "absolute", bottom: 0, width: "100%", backgroundColor: "#d2fffa", flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 15 },
    iconContainer: { padding: 10, backgroundColor: "#8bd5cc", borderRadius: 40, alignItems: "center", justifyContent: "center" },
    activeIcon: { backgroundColor: "#214297" },
});
