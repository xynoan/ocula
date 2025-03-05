import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

const profile = {
    fullName: "John Doe",
    phoneNumber: "+1234567890",
    email: "johndoe@example.com",
    password: "********",
    profilePicture: require("../../assets/images/frieren.jpg"),
};

export default function ProfileScreen() {
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
                <TouchableOpacity style={styles.actionButton}><Text style={styles.actionText}>Delete Account</Text></TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}><Text style={styles.actionText}>Logout</Text></TouchableOpacity>
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
});
