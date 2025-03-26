// TODO: use liveness detection instead for anti-spoofing.
import 'react-native-get-random-values';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import React, { useState, useRef, useEffect } from "react";
// AWS config
import { s3Client, BUCKET_NAME, COLLECTION_ID, rekognitionClient } from "./aws/config";
// AWS S3 - storage
import { uploadToS3, deleteFromS3, refreshPresignedUrls, fetchRegisteredFaces } from "./aws/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// AWS Rekognition - face detection
import { DeleteFacesCommand } from "@aws-sdk/client-rekognition";
// Camera
import { CameraType, useCameraPermissions, CameraView } from "expo-camera";
// Icons
import { Ionicons } from "@expo/vector-icons";
// UUID - unique id
import uuid from "react-native-uuid";
import { checkForDuplicate, deleteFace, detectFaces } from './aws/rekognition';

export default function ShieldScreen() {
    const [isEntranceEnabled, setIsEntranceEnabled] = useState(true);
    const [isEntityEnabled, setIsEntityEnabled] = useState(true);
    const [permission, requestPermission] = useCameraPermissions();
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraType, setCameraType] = useState<CameraType>('front');
    const [registeredFaces, setRegisteredFaces] = useState<{ id: string, uri: string, s3Key?: string }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState("");
    const cameraRef = useRef<CameraView>(null);

    const toggleEntrance = () => setIsEntranceEnabled((prev) => !prev);
    const toggleEntity = () => setIsEntityEnabled((prev) => !prev);

    const handleCameraAccess = async () => {
        if (!permission?.granted) {
            await requestPermission();
        }
        setIsCameraActive(true);
    };

    const captureFace = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                setIsProcessing(true);
                setIsCameraActive(false);

                const imageId = uuid.v4().toString();

                // Step 1: Upload to S3
                const imageKey = await uploadToS3(photo?.uri || '', imageId, setProcessingStatus);

                // Step 2: Detect faces and check criteria
                const faceDetectionResult = await detectFaces(imageKey, setProcessingStatus);

                if (!faceDetectionResult.success) {
                    // Delete the image from S3 if criteria not met
                    await deleteFromS3(imageKey);

                    // Also delete the face from Rekognition collection if we have a faceId
                    if (faceDetectionResult.faceId) {
                        try {
                            await rekognitionClient.send(new DeleteFacesCommand({
                                CollectionId: COLLECTION_ID,
                                FaceIds: [faceDetectionResult.faceId]
                            }));
                        } catch (rekognitionError) {
                            console.error("Error deleting failed face from collection:", rekognitionError);
                            // Continue with the alert even if deletion fails
                        }
                    }

                    setIsProcessing(false);
                    Alert.alert("Registration Failed", faceDetectionResult.error);
                    return;
                }

                // Step 3: Check for duplicates
                const duplicateCheck = await checkForDuplicate(imageKey, registeredFaces, setProcessingStatus);

                if (duplicateCheck.isDuplicate) {
                    // Delete the image from S3 if it's a duplicate
                    await deleteFromS3(imageKey);

                    // Also delete the face from Rekognition collection if we have a faceId
                    if (faceDetectionResult.faceId) {
                        try {
                            await rekognitionClient.send(new DeleteFacesCommand({
                                CollectionId: COLLECTION_ID,
                                FaceIds: [faceDetectionResult.faceId]
                            }));
                        } catch (rekognitionError) {
                            console.error("Error deleting duplicate face from collection:", rekognitionError);
                            // Continue with the alert even if deletion fails
                        }
                    }

                    setIsProcessing(false);
                    Alert.alert("Registration Failed", "Face is already registered");
                    return;
                }

                // All criteria met, save the face
                if (faceDetectionResult.faceId) {
                    try {
                        // Generate a presigned URL for the newly uploaded image
                        const command = new GetObjectCommand({
                            Bucket: BUCKET_NAME,
                            Key: imageKey
                        });
                        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

                        setRegisteredFaces(prev => [
                            ...prev,
                            {
                                id: faceDetectionResult.faceId,
                                uri: presignedUrl, // Use the presigned URL
                                s3Key: imageKey
                            }
                        ]);
                    } catch (presignError) {
                        console.error("Error generating presigned URL:", presignError);
                        // Fall back to using the local URI temporarily
                        setRegisteredFaces(prev => [
                            ...prev,
                            {
                                id: faceDetectionResult.faceId,
                                uri: photo?.uri || '',
                                s3Key: imageKey
                            }
                        ]);
                    }
                }

                setIsProcessing(false);
                Alert.alert("Success", "Face registered successfully!");

            } catch (error) {
                setIsProcessing(false);
                Alert.alert("Error", "Failed to register face. Please try again.");
                console.error(error);
            }
        }
    };
        
    // Toggle Camera Type (Front/Back)
    const switchCamera = () => {
        setCameraType((prevType) => (prevType === 'back' ? 'front' : 'back'));
    };

    // Set up an interval to refresh presigned URLs every 50 minutes
    useEffect(() => {
        const refreshInterval = setInterval(refreshPresignedUrls, 50 * 60 * 1000);
        return () => clearInterval(refreshInterval);
    }, [registeredFaces]);

    useEffect(() => {
        fetchRegisteredFaces(setIsProcessing, setProcessingStatus, setRegisteredFaces);
    }, []);

    return (
        <View style={styles.securityContainer}>
            {/* Face Registration */}
            <View style={styles.faceContainer}>
                <View style={styles.faceHeader}>
                    <Ionicons name="person" size={40} color="#5b7084" />
                    <View style={{ alignItems: "flex-start" }}>
                        <Text style={styles.faceTitle}>Registered Faces</Text>
                        <Text style={styles.instructionText}>Hold a face to delete it</Text>
                        <View style={styles.faceList}>
                            {registeredFaces.length === 0 ? (
                                <Text style={{ color: "red" }}>No faces registered</Text>
                            ) : (
                                registeredFaces.map((face, index) => (
                                    <TouchableOpacity key={index} onLongPress={() => deleteFace(index, registeredFaces, setRegisteredFaces,setIsProcessing, setProcessingStatus, deleteFromS3)}>
                                        <Image source={{ uri: face.uri }} style={styles.faceImage} />
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.registerButton} onPress={handleCameraAccess}>
                    <Ionicons name="add-outline" size={40} color="#fff" />
                    <Text style={styles.registerText}>Register New Face</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => fetchRegisteredFaces(setIsProcessing, setProcessingStatus, setRegisteredFaces)}
                    style={styles.refreshButton}
                    activeOpacity={0.6}
                >
                    <Ionicons name="refresh" size={24} color="#243483" />
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

            {/* Processing Indicator */}
            {isProcessing && (
                <View style={styles.processingContainer}>
                    <ActivityIndicator size="large" color="#243483" />
                    <Text style={styles.processingText}>{processingStatus}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    securityContainer: { flex: 1, alignItems: "flex-start", gap: 15, width: 300, marginTop: 15 },
    faceContainer: { alignItems: "flex-start", backgroundColor: "#ededf5", borderRadius: 20, overflow: "hidden", width: "100%", position: "relative" },
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
    instructionText: { fontSize: 12, color: "#5b7084", marginTop: 2 },
    processingContainer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.8)", justifyContent: "center", alignItems: "center" },
    processingText: { marginTop: 10, fontSize: 16, color: "#243483", fontWeight: "bold" },
    refreshButton: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(255,255,255,0.9)",
        padding: 8,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 10
    },
});
