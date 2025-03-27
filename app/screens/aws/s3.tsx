import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { COLLECTION_ID, rekognitionClient, s3Client } from "./config";
import { BUCKET_NAME } from "./config";
import { imageToBase64 } from "../utils/imageUtil";
import { ListFacesCommand } from "@aws-sdk/client-rekognition";
import { Alert } from "react-native";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Buffer } from "buffer";

export const uploadToS3 = async (uri: string, imageId: string, setProcessingStatus: (status: string) => void) => {
    try {
        setProcessingStatus("Uploading image...");
        const base64Data = await imageToBase64(uri);
        const buffer = Buffer.from(base64Data, 'base64');
        const s3Key = `${imageId}.jpg`;

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

export const deleteFromS3 = async (key: string) => {
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

// Fetch registered faces
export const fetchRegisteredFaces = async (setIsProcessing: (isProcessing: boolean) => void, setProcessingStatus: (status: string) => void, setRegisteredFaces: (faces: any[]) => void) => {
    try {
        setIsProcessing(true);
        setProcessingStatus("Fetching registered faces...");

        const params = {
            CollectionId: COLLECTION_ID,
            MaxResults: 100, // Adjust as needed
        };

        const command = new ListFacesCommand(params);
        const response = await rekognitionClient.send(command);

        if (response.Faces && response.Faces.length > 0) {
            const facesPromises = response.Faces.map(async face => {
                let presignedUrl = '';
                const s3Key = face.ExternalImageId || '';

                if (s3Key) {
                    try {
                        // Create command to get the object
                        const getObjectParams = {
                            Bucket: BUCKET_NAME,
                            Key: s3Key
                        };
                        const command = new GetObjectCommand(getObjectParams);

                        // Generate a presigned URL that expires in 1 hour
                        presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                    } catch (presignError) {
                        console.error("Error generating presigned URL:", presignError);
                    }
                }

                return {
                    id: face.FaceId || '',
                    uri: presignedUrl || '', // Use the presigned URL as the URI
                    s3Key: s3Key
                };
            });

            const faces = await Promise.all(facesPromises);
            setRegisteredFaces(faces);
        }

        setIsProcessing(false);
    } catch (error) {
        console.error("Error fetching registered faces:", error);
        setIsProcessing(false);
        Alert.alert("Error", "Failed to fetch registered faces. Please try again.");
    }
};

// Refresh presigned URLs for faces
export const refreshPresignedUrls = async (registeredFaces: any[], setRegisteredFaces: (faces: any[]) => void) => {
    // Only refresh if we have registered faces
    if (registeredFaces.length === 0) return;

    try {
        const updatedFaces = await Promise.all(
            registeredFaces.map(async (face) => {
                // If we have an s3Key, generate a new presigned URL
                if (face.s3Key) {
                    try {
                        const getObjectParams = {
                            Bucket: BUCKET_NAME,
                            Key: face.s3Key
                        };
                        const command = new GetObjectCommand(getObjectParams);
                        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

                        return {
                            ...face,
                            uri: presignedUrl
                        };
                    } catch (error) {
                        console.error("Error refreshing presigned URL:", error);
                        return face; // Return face unchanged if error
                    }
                }
                return face; // Return face unchanged if no s3Key
            })
        );

        setRegisteredFaces(updatedFaces);
    } catch (error) {
        console.error("Error refreshing presigned URLs:", error);
    }
};

export default uploadToS3;