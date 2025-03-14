// TODO(refactor): improve phone number validation
import { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import app from '../firebaseConfig';

export default function ProfileSetup() {
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);

    useEffect(() => {
        const loadExistingProfile = async () => {
            const auth = getAuth(app);
            const user = auth.currentUser;
            if (!user) return;

            try {
                const db = getFirestore(app);
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFullName(data.fullName || '');
                    setPhoneNumber(data.phoneNumber || '');
                    setImage(data.profilePicture || null);
                    setIsUpdate(true);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            }
        };

        loadExistingProfile();
    }, []);

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Sorry, we need camera roll permissions to make this work!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "images",
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
            console.log(error);
        }
    };

    const validateForm = () => {
        if (!fullName.trim()) {
            Alert.alert('Error', 'Please enter your full name');
            return false;
        }
        if (!phoneNumber.trim()) {
            Alert.alert('Error', 'Please enter your phone number');
            return false;
        }
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phoneNumber)) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const auth = getAuth(app);
        const user = auth.currentUser;

        if (!user) {
            Alert.alert('Error', 'No user found. Please try logging in again.');
            return;
        }

        setLoading(true);

        try {
            const db = getFirestore(app);

            const userRef = doc(db, 'users', user.uid);
            const baseUserData = {
                fullName,
                phoneNumber,
                email: user.email,
                profilePicture: image && image.length < 1048576 ? image : null, // Limit to ~1MB
                updatedAt: new Date().toISOString(),
            };

            if (!isUpdate) {
                await setDoc(userRef, {
                    ...baseUserData,
                    createdAt: new Date().toISOString(),
                });
            } else {
                await updateDoc(userRef, baseUserData);
            }

            Alert.alert(
                'Success',
                isUpdate ? 'Profile updated successfully!' : 'Profile setup complete!',
                [{ text: 'OK', onPress: () => router.replace("/login") }]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to save profile. Please try again.');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.content}>
                    <Text style={styles.title}>Complete Your Profile</Text>
                    <Text style={styles.subtitle}>Let's get to know you better</Text>

                    <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.form}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your full name"
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                        />

                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your phone number"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />

                        <TouchableOpacity 
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Complete Setup</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d2fff9',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1c4695',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    imageContainer: {
        marginBottom: 24,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    imagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#8ad6cc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        color: '#fff',
        fontSize: 16,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 16,
        color: '#1c4695',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#8ad6cc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#1c4695',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});