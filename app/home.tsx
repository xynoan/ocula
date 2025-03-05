import { useState, useRef } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Index() {
    const [activeScreen, setActiveScreen] = useState<keyof typeof screens>("camera");
    const slideAnim = useRef(new Animated.Value(0)).current;

    const screens = {
        camera: <Text style={[styles.screenText, { color: "#000" }]}>Camera UI</Text>,
        images: <Text style={styles.screenText}>Gallery UI</Text>,
        shield: <Text style={styles.screenText}>Security UI</Text>,
        person: <Text style={styles.screenText}>Profile UI</Text>,
    };

    const openScreen = (screen: keyof typeof screens) => {
        if (activeScreen === screen) {
            Animated.timing(slideAnim, {
                toValue: 1000,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setActiveScreen("camera");
                slideAnim.setValue(0); 
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
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
            <Animated.View
                style={[
                    styles.screenContainer,
                    activeScreen === "camera" ? styles.cameraBackground : null,
                    { transform: [{ translateY: slideAnim }] },
                ]}
            >
                {screens[activeScreen]}
            </Animated.View>

            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[styles.iconContainer, activeScreen === "camera" && styles.activeIcon]}
                    onPress={() => openScreen("camera")}
                >
                    <Ionicons name="camera" size={40} color="#fffeff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.iconContainer, activeScreen === "images" && styles.activeIcon]}
                    onPress={() => openScreen("images")}
                >
                    <Ionicons name="images" size={40} color="#fffeff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.iconContainer, activeScreen === "shield" && styles.activeIcon]}
                    onPress={() => openScreen("shield")}
                >
                    <Image
                        style={{ height: 50, width: 40, tintColor: "#fffeff" }}
                        source={require('../assets/images/shield.png')}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.iconContainer, activeScreen === "person" && styles.activeIcon]}
                    onPress={() => openScreen("person")}
                >
                    <Ionicons name="person" size={40} color="#fffeff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#fff",
    },
    screenContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#d2fffa",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    cameraBackground: {
        backgroundColor: "#ffffff",
    },
    screenText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    bottomContainer: {
        borderRadius: 40,
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#d2fffa",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 15,
    },
    iconContainer: {
        padding: 10,
        backgroundColor: "#8bd5cc",
        borderRadius: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    activeIcon: {
        backgroundColor: "#214297",
    },
});