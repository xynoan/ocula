import { View, FlatList, Image, StyleSheet } from "react-native";

const sampleImages = [
    require("../../assets/images/frieren.jpg"),
    require("../../assets/images/jinwoo.jpg")
];

export default function ImagesScreen() {
    return (
        <View style={styles.galleryContainer}>
            <FlatList
                data={sampleImages}
                numColumns={2}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <Image source={item} style={styles.galleryImage} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    galleryContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    galleryImage: { width: 150, height: 150, margin: 10, borderRadius: 10 },
});
