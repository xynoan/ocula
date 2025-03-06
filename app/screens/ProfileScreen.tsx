import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { signOut, deleteUser } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const profile = {
    fullName: "John Doe",
    phoneNumber: "+1234567890",
    email: "johndoe@example.com",
    password: "********",
    profilePicture: require("../../assets/images/frieren.jpg"),
};

export default function ProfileScreen() {
    const handleLogout = async () => {
        try {
            await signOut(auth);
            await AsyncStorage.removeItem("email");
            await AsyncStorage.removeItem("password");
            Alert.alert('Success', 'You have been logged out.');
            router.replace("/login");
        } catch (error) {
            Alert.alert('Error', 'Failed to logout. Please try again.');
        }
    };
    return (
        <ScrollView style={styles.profileContainer}>
            <View style={styles.section}>
                <Image source={profile.profilePicture} style={styles.profileImage} />
                <Text style={styles.profileName}>{profile.fullName}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profile Details</Text>
                <Text style={styles.detailText}>Phone: {profile.phoneNumber}</Text>
                <Text style={styles.detailText}>Email: {profile.email}</Text>
                <Text style={styles.detailText}>Password: {profile.password}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Management</Text>
                <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
                    <Text style={styles.actionText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.section, styles.dangerZone]}>
                <Text style={styles.dangerTitle}>Danger Zone</Text>
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => {
                        Alert.alert(
                            'Delete Account',
                            'Are you sure about this? This action cannot be undone.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { 
                                    text: 'Delete', 
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            const user = auth.currentUser;
                                            if (user) {
                                                await deleteUser(user);
                                                await AsyncStorage.clear();
                                                Alert.alert('Success', 'Your account has been deleted.');
                                                router.replace('/login');
                                            }
                                        } catch (error) {
                                            Alert.alert('Error', 'Failed to delete account. Please try again.');
                                        }
                                    }
                                }
                            ]
                        );
                    }}
                >
                    <Text style={styles.deleteText}>Delete Account</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    profileContainer: { flex: 1, width: "100%", padding: 20 },
    section: { marginBottom: 20, alignItems: "center" },
    sectionTitle: { fontSize: 20, fontWeight: "bold", marginTop: 10 },
    profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
    profileName: { fontSize: 20, fontWeight: "bold" },
    detailText: { fontSize: 16, color: "#555" },
    actionButton: { backgroundColor: "#214297", padding: 10, borderRadius: 10, width: "90%", alignItems: "center", marginTop: 10 },
    actionText: { color: "#fff", fontSize: 16 },
    dangerZone: {
        backgroundColor: '#fff1f0',
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ffccc7'
    },
    dangerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: '#cf1322',
        marginBottom: 10
    },
    deleteButton: {
        backgroundColor: '#ff4d4f',
        padding: 10,
        borderRadius: 10,
        width: "90%",
        alignItems: "center",
        marginTop: 10
    },
    deleteText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    }
});
