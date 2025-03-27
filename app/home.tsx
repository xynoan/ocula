import React, { useCallback, useRef, useMemo, useState } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { StyleSheet, Animated, TouchableOpacity, View, Image, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PanGestureHandler } from 'react-native-gesture-handler';
import CameraScreen from "./screens/CameraScreen";
import ImagesScreen from "./screens/ImagesScreen";
import ShieldScreen from "./screens/ShieldScreen";
import ProfileScreen from "./screens/ProfileScreen";

export default function Index() {
    const [activeScreen, setActiveScreen] = useState<keyof typeof screens>("camera");
    const slideAnim = useRef(new Animated.Value(1000)).current;
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["15%", "100%"], []);
    const [userSelectedScreen, setUserSelectedScreen] = useState<keyof typeof screens | null>(null);
    const screenWidth = Dimensions.get('window').width;
    const translateX = useRef(new Animated.Value(0)).current;

    const screenOrder = useMemo(() => ["camera", "images", "shield", "person"] as const, []);
    
    const handleSheetChange = useCallback((index: number) => {
        if (index === 0) {
            setActiveScreen("camera");
            setUserSelectedScreen(null);
        } else if (index === 1 && userSelectedScreen === null) {
            setActiveScreen("images");
        }
    }, [userSelectedScreen]);

    const handleSnapPress = useCallback((index: number) => {
        sheetRef.current?.snapToIndex(index);
    }, []);

    const screens = {
        camera: <CameraScreen />,
        images: <ImagesScreen />,
        shield: <ShieldScreen />,
        person: <ProfileScreen />,
    };

    const openScreen = (screen: keyof typeof screens) => {
        setUserSelectedScreen(screen);
        setActiveScreen(screen);
        slideAnim.setValue(1000);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.state === 5) { // END state
            const { translationX } = event.nativeEvent;
            const currentIndex = screenOrder.indexOf(activeScreen);
            
            // Threshold for swipe detection
            if (Math.abs(translationX) > screenWidth * 0.2) {
                if (translationX > 0) {
                    // Swipe right - go to previous screen
                    const prevIndex = Math.max(0, currentIndex - 1);
                    const prevScreen = screenOrder[prevIndex];
                    
                    if (prevScreen === "camera" && activeScreen !== "camera") {
                        // When swiping to camera, collapse the bottom sheet
                        handleSnapPress(0);
                    } else {
                        openScreen(prevScreen);
                    }
                } else {
                    // Swipe left - go to next screen
                    const nextIndex = Math.min(screenOrder.length - 1, currentIndex + 1);
                    openScreen(screenOrder[nextIndex]);
                    
                    // If we're not on the camera tab, ensure the bottom sheet is expanded
                    if (screenOrder[nextIndex] !== "camera") {
                        handleSnapPress(1);
                    }
                }
            }
            
            // Reset the animation value
            Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
            }).start();
        }
    };

    const iconStyle = { width: 40, height: 40 };

    return (
        <GestureHandlerRootView style={styles.container}>
            {screens["camera"]}
            <BottomSheet
                ref={sheetRef}
                snapPoints={snapPoints}
                enableDynamicSizing={false}
                onChange={handleSheetChange}
                style={styles.bottomSheet}
            >
                <View style={styles.bottomContainer}>
                    <TouchableOpacity style={[styles.iconContainer, activeScreen === "camera" && styles.activeIcon]} onPress={() => { setActiveScreen("camera"); handleSnapPress(0); }}>
                        <Ionicons name="camera" size={40} color="#fffeff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.iconContainer, activeScreen === "images" && styles.activeIcon]} onPress={() => { openScreen("images"); handleSnapPress(1); }}>
                        <Ionicons name="images" size={40} color="#fffeff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.iconContainer, activeScreen === "shield" && styles.activeIcon]} onPress={() => { openScreen("shield"); handleSnapPress(1); }}>
                        <Image style={iconStyle} source={require('../assets/images/shield.png')} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.iconContainer, activeScreen === "person" && styles.activeIcon]} onPress={() => { openScreen("person"); handleSnapPress(1); }}>
                        <Ionicons name="person" size={40} color="#fffeff" />
                    </TouchableOpacity>
                </View>
                <PanGestureHandler
                    onGestureEvent={onGestureEvent}
                    onHandlerStateChange={onHandlerStateChange}
                >
                    <Animated.View style={[styles.bottomSheetScrollView, {
                        transform: [{ translateX }]
                    }]}>
                        <BottomSheetView style={styles.bottomSheetView}>
                            <Animated.View style={[styles.screenContainer, activeScreen === "camera" ? styles.cameraBackground : null]}>
                                {screens[activeScreen]}
                            </Animated.View>
                        </BottomSheetView>
                    </Animated.View>
                </PanGestureHandler>
            </BottomSheet>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", backgroundColor: "#fff" },
    screenContainer: { flex: 1, justifyContent: "center", alignItems: "center", width: "100%", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#d2fffa" },
    cameraBackground: { backgroundColor: "#ffffff" },
    bottomContainer: { position: "fixed", top: 0, width: "100%", backgroundColor: "#d2fffa", flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 15, borderTopEndRadius: 40, borderTopStartRadius: 40 },
    iconContainer: { padding: 10, backgroundColor: "#8bd5cc", borderRadius: 40, alignItems: "center", justifyContent: "center" },
    activeIcon: { backgroundColor: "#214297" },
    bottomSheetScrollView: { flex: 1, backgroundColor: "#d2fffa" },
    bottomSheetView: { flex: 1 },
    bottomSheet: { zIndex: 50 },
});
