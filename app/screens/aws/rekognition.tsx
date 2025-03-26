import { IndexFacesCommand, SearchFacesByImageCommand, DeleteFacesCommand } from "@aws-sdk/client-rekognition";
import { BUCKET_NAME, COLLECTION_ID, rekognitionClient } from "./config";
import { Alert } from "react-native";

export const detectFaces = async (imageKey: string, setProcessingStatus: (status: string) => void) => {
    try {
        setProcessingStatus("Looking for faces...");

        const params = {
            Image: {
                S3Object: {
                    Bucket: BUCKET_NAME,
                    Name: imageKey,
                },
            },
            Attributes: ["ALL"], // Request all attributes to perform additional checks
        };

        const command = new IndexFacesCommand({
            CollectionId: COLLECTION_ID,
            Image: params.Image,
            MaxFaces: 10, // We want to know if there are multiple faces
            ExternalImageId: imageKey,
            DetectionAttributes: ["ALL"], // Request quality and other attributes
        });

        const response = await rekognitionClient.send(command);

        if (!response.FaceRecords || response.FaceRecords.length === 0) {
            return { success: false, error: "No face detected" };
        }

        if (response.FaceRecords.length > 1) {
            return { success: false, error: "Multiple faces detected" };
        }

        // Check face quality metrics to help detect photos of photos
        const faceDetail = response.FaceRecords[0].FaceDetail;

        // Check if image might be a photo of a photo (anti-spoofing)
        if (faceDetail) {
            // Check sharpness - photos of photos are typically less sharp
            if (faceDetail.Quality && faceDetail.Quality.Sharpness && faceDetail.Quality.Sharpness < 50) {
                return { success: false, error: "Poor image quality detected. Please try again with better lighting." };
            }

            // Check brightness - photos of photos often have uneven brightness
            if (faceDetail.Quality && faceDetail.Quality.Brightness && faceDetail.Quality.Brightness < 40) {
                return { success: false, error: "Low brightness detected. Please try again with better lighting." };
            }
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

export const checkForDuplicate = async (imageKey: string, registeredFaces: any[], setProcessingStatus: (status: string) => void) => {
    try {
        setProcessingStatus("Checking for duplicates...");

        // If there are no registered faces yet, we can skip the check
        // This ensures we don't get false positives when the collection might have orphaned records
        if (registeredFaces.length === 0) {
            return { isDuplicate: false };
        }
        
        const response = await rekognitionClient.send(new SearchFacesByImageCommand({
            CollectionId: COLLECTION_ID,
            Image: {
                S3Object: {
                    Bucket: BUCKET_NAME,
                    Name: imageKey,
                },
            },
            MaxFaces: 5,
            FaceMatchThreshold: 90,
        }));

        if (response.FaceMatches && response.FaceMatches.length > 0) {
            // For a face to be considered a duplicate, it must be a very high match
            const otherMatchExists = response.FaceMatches.some(
                match => match.Face?.ExternalImageId !== imageKey && match.Similarity && match.Similarity > 90
            );

            if (otherMatchExists) {
                return { isDuplicate: true };
            }
        }

        return { isDuplicate: false };
    } catch (error) {
        // This error might occur if the face was just added but not yet searchable
        // We'll consider it not a duplicate in this case
        console.error("Error checking for duplicate:", error);
        return { isDuplicate: false };
    }
};

// Delete Registered Face
export const deleteFace = (index: number, registeredFaces: any[], setRegisteredFaces: (faces: any[]) => void, setIsProcessing: (isProcessing: boolean) => void, setProcessingStatus: (status: string) => void, deleteFromS3: (s3Key: string) => Promise<void>) => {
    Alert.alert(
        "Delete Face",
        "Are you sure you want to remove this face?",
        [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        setIsProcessing(true);
                        setProcessingStatus("Deleting face...");

                        const faceToDelete = registeredFaces[index];

                        // 1. Delete from Rekognition collection
                        const deleteParams = {
                            CollectionId: COLLECTION_ID,
                            FaceIds: [faceToDelete.id]
                        };

                        await rekognitionClient.send(new DeleteFacesCommand(deleteParams));

                        // 2. Delete from S3 bucket using the stored S3 key
                        if (faceToDelete.s3Key) {
                            try {
                                await deleteFromS3(faceToDelete.s3Key);
                            } catch (s3Error) {
                                console.error("Error deleting from S3:", s3Error);
                                // Continue with UI update even if S3 delete fails
                            }
                        }
                        // 3. Update the UI state
                        setRegisteredFaces(registeredFaces.filter((_, i) => i !== index));

                        setIsProcessing(false);
                    } catch (error) {
                        console.error("Error deleting face:", error);
                        Alert.alert(
                            "Error",
                            "Failed to delete face. Please try again."
                        );
                        setIsProcessing(false);
                    }
                },
            },
        ]
    );
};