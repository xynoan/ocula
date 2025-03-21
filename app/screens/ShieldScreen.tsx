// TODO: duplicate face bug
// TODO: use deleteFromS3() on deleteFace()
// TODO: make this file modular. Too much code in one file.
import 'react-native-get-random-values';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useRef } from "react";
import { CameraType, useCameraPermissions, CameraView } from "expo-camera";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { RekognitionClient, IndexFacesCommand, SearchFacesByImageCommand } from "@aws-sdk/client-rekognition";
import uuid from "react-native-uuid";
import { 
    AWS_REGION, 
    AWS_ACCESS_KEY_ID, 
    AWS_SECRET_ACCESS_KEY,
    AWS_BUCKET_NAME,
    AWS_COLLECTION_ID
} from "@env"
const Buffer = require('buffer/').Buffer;
// AWS Configuration
const awsConfig = {
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
};

const s3Client = new S3Client(awsConfig);
const rekognitionClient = new RekognitionClient(awsConfig);
const BUCKET_NAME = AWS_BUCKET_NAME;
const COLLECTION_ID = AWS_COLLECTION_ID;

export default function ShieldScreen() {
    const [isEntranceEnabled, setIsEntranceEnabled] = useState(true);
    const [isEntityEnabled, setIsEntityEnabled] = useState(true);
    const [permission, requestPermission] = useCameraPermissions();
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraType, setCameraType] = useState<CameraType>('front');
    const [registeredFaces, setRegisteredFaces] = useState<{ id: string, uri: string }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState("");
    const cameraRef = useRef<CameraView>(null);

    // Toggle Functions
    const toggleEntrance = () => setIsEntranceEnabled((prev) => !prev);
    const toggleEntity = () => setIsEntityEnabled((prev) => !prev);

    // Handle Camera Access
    const handleCameraAccess = async () => {
        if (!permission?.granted) {
            await requestPermission();
        }
        setIsCameraActive(true);
    };

    // Convert image to base64
    const imageToBase64 = async (uri: string) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result?.toString().split(',')[1];
                resolve(base64 || '');
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // Upload image to S3
    const uploadToS3 = async (uri: string, imageId: string) => {
        try {
            setProcessingStatus("Uploading image...");
            const base64Data = await imageToBase64(uri);
            const buffer = Buffer.from(base64Data, 'base64');
            const s3Key = `${imageId}.jpg`;
            // const s3Key = `faces-${imageId}.jpg`;

            const params = {
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: buffer,
                ContentType: 'image/jpeg',
            };

            await s3Client.send(new PutObjectCommand(params));
            return s3Key;
        } catch (error) {
            console.error("Error uploading to S3:", error);
            throw error;
        }
    };

    // Delete image from S3
    const deleteFromS3 = async (key: string) => {
        try {
            const params = {
                Bucket: BUCKET_NAME,
                Key: key,
            };
            await s3Client.send(new DeleteObjectCommand(params));
        } catch (error) {
            console.error("Error deleting from S3:", error);
        }
    };

    // Check for face in image using Rekognition
    const detectFaces = async (imageKey: string) => {
        try {
            setProcessingStatus("Looking for faces...");

            const params = {
                Image: {
                    S3Object: {
                        Bucket: BUCKET_NAME,
                        Name: imageKey,
                    },
                },
                Attributes: ["DEFAULT"],
            };

            const command = new IndexFacesCommand({
                CollectionId: COLLECTION_ID,
                Image: params.Image,
                MaxFaces: 10, // We want to know if there are multiple faces
                ExternalImageId: imageKey,
            });

            const response = await rekognitionClient.send(command);

            if (!response.FaceRecords || response.FaceRecords.length === 0) {
                return { success: false, error: "No face detected" };
            }

            if (response.FaceRecords.length > 1) {
                return { success: false, error: "Multiple faces detected" };
            }

            return {
                success: true,
                faceId: response.FaceRecords[0].Face?.FaceId || "",
                imageKey
            };
        } catch (error) {
            console.error("Error detecting faces:", error);
            throw error;
        }
    };

    // Check if face already exists
    const checkForDuplicate = async (imageKey: string) => {
        try {
            setProcessingStatus("Checking for duplicates...");

            const params = {
                CollectionId: COLLECTION_ID,
                Image: {
                    S3Object: {
                        Bucket: BUCKET_NAME,
                        Name: imageKey,
                    },
                },
                MaxFaces: 1,
                FaceMatchThreshold: 95, // High threshold for considering it a match
            };

            const command = new SearchFacesByImageCommand(params);
            const response = await rekognitionClient.send(command);

            if (response.FaceMatches && response.FaceMatches.length > 0) {
                // Face already exists with high similarity
                return { isDuplicate: true };
            }

            return { isDuplicate: false };
        } catch (error) {
            // This error might occur if the face was just added but not yet searchable
            // We'll consider it not a duplicate in this case
            console.error("Error checking for duplicate:", error);
            return { isDuplicate: false };
        }
    };

    // Capture Image and Register Face
    const captureFace = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                setIsProcessing(true);
                setIsCameraActive(false);

                const imageId = uuid.v4().toString();

                // Step 1: Upload to S3
                const imageKey = await uploadToS3(photo?.uri || '', imageId);

                // Step 2: Detect faces and check criteria
                const faceDetectionResult = await detectFaces(imageKey);

                if (!faceDetectionResult.success) {
                    // Delete the image from S3 if criteria not met
                    await deleteFromS3(imageKey);
                    setIsProcessing(false);
                    Alert.alert("Registration Failed", faceDetectionResult.error);
                    return;
                }

                // Step 3: Check for duplicates
                const duplicateCheck = await checkForDuplicate(imageKey);

                if (duplicateCheck.isDuplicate) {
                    // Delete the image from S3 if it's a duplicate
                    await deleteFromS3(imageKey);
                    setIsProcessing(false);
                    Alert.alert("Registration Failed", "Face is already registered");
                    return;
                }

                // All criteria met, save the face
                if (faceDetectionResult.faceId) {
                    setRegisteredFaces(prev => [
                        ...prev,
                        {
                            id: faceDetectionResult.faceId,
                            uri: photo?.uri || ''
                        }
                    ]);
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

    // Delete Registered Face
    const deleteFace = (index: number) => {
        Alert.alert(
            "Delete Face",
            "Are you sure you want to remove this face?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        setRegisteredFaces((prevFaces) => prevFaces.filter((_, i) => i !== index));
                        // Note: You should also delete from AWS Rekognition collection here
                    },
                },
            ]
        );
    };

    // Toggle Camera Type (Front/Back)
    const switchCamera = () => {
        setCameraType((prevType) => (prevType === 'back' ? 'front' : 'back'));
    };

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
                                    <TouchableOpacity key={index} onLongPress={() => deleteFace(index)}>
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
    faceContainer: { alignItems: "flex-start", backgroundColor: "#ededf5", borderRadius: 20, overflow: "hidden", width: "100%" },
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
});
