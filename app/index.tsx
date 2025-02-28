import React, { useEffect, useRef } from "react";
import { View, Image, StyleSheet, Platform, Animated, StatusBar } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const slideAnim = useRef(new Animated.Value(150)).current;
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === "web" ||
      Platform.OS === "android" &&
      typeof document !== "undefined"
    ) {
      document.title = "Ocula";
    }

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      router.replace("/login");
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f2f2f2" barStyle="dark-content" />
      <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
        <Image
          source={require("../assets/images/Ocula_Logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 200, height: 200 },
});
