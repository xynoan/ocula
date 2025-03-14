// TODO: add change password
// TODO: replicate UI from canva
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { signOut, deleteUser } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, deleteDoc } from "firebase/firestore";
import app from "../../firebaseConfig";

interface ProfileData {
    fullName: string;
    phoneNumber: string;
    email: string;
    profilePicture: string | null;
}

export default function ProfileScreen() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                router.replace("/login");
                return;
            }

            const db = getFirestore(app);
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            
            if (userDoc.exists()) {
                setProfile(userDoc.data() as ProfileData);
            } else {
                router.replace("/profile-setup");
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            await AsyncStorage.removeItem("email");
            await AsyncStorage.removeItem("password");
            Alert.alert('Success', 'You have been logged out.');
            router.replace("/login");
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#214297" />
            </View>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <ScrollView style={styles.profileContainer}>
            <View style={styles.section}>
                {profile.profilePicture ? (
                    <Image 
                        source={{ uri: profile.profilePicture }} 
                        style={styles.profileImage} 
                    />
                ) : (
                    <View style={[styles.profileImage, styles.noPhotoContainer]}>
                        <Text style={styles.noPhotoText}>
                            {profile.fullName?.charAt(0) || '?'}
                        </Text>
                    </View>
                )}
                <Text style={styles.profileName}>{profile.fullName}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profile Details</Text>
                <Text style={styles.detailText}>Phone: {profile.phoneNumber}</Text>
                <Text style={styles.detailText}>Email: {profile.email}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Management</Text>
                <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => router.push("/profile-setup")}
                >
                    <Text style={styles.actionText}>Edit Profile</Text>
                </TouchableOpacity>
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
                                                const db = getFirestore(app);
                                                await deleteDoc(doc(db, 'users', user.uid));
                                                await deleteUser(user);
                                                await AsyncStorage.clear();
                                                Alert.alert('Success', 'Your account has been deleted.');
                                                router.replace('/login');
                                            }
                                        } catch (error) {
                                            console.log(error);
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#d2fff9',
    },
    profileContainer: { 
        flex: 1, 
        width: "100%", 
        padding: 20,
        backgroundColor: '#d2fff9',
    },
    section: { marginBottom: 20, alignItems: "center" },
    sectionTitle: { fontSize: 20, fontWeight: "bold", marginTop: 10, color: '#1c4695' },
    profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
    noPhotoContainer: {
        backgroundColor: '#8ad6cc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noPhotoText: {
        fontSize: 40,
        color: '#fff',
        fontWeight: 'bold',
    },
    profileName: { fontSize: 20, fontWeight: "bold", color: '#1c4695', textAlign: "center" },
    detailText: { fontSize: 16, color: "#555", marginVertical: 5 },
    actionButton: { 
        backgroundColor: "#214297", 
        padding: 10, 
        borderRadius: 10, 
        width: "90%", 
        alignItems: "center", 
        marginTop: 10 
    },
    actionText: { color: "#fff", fontSize: 16 },
    dangerZone: {
        backgroundColor: '#fff1f0',
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ffccc7',
        marginTop: 20,
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
