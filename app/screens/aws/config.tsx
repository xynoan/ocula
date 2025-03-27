import { RekognitionClient } from "@aws-sdk/client-rekognition";
import { S3Client } from "@aws-sdk/client-s3";

export const awsConfig = {
    region: process.env.EXPO_PUBLIC_AWS_REGION,
    credentials: {
        accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
    },
};

export const s3Client = new S3Client(awsConfig);
export const BUCKET_NAME = process.env.EXPO_PUBLIC_AWS_BUCKET_NAME;
export const rekognitionClient = new RekognitionClient(awsConfig);
export const COLLECTION_ID = process.env.EXPO_PUBLIC_AWS_COLLECTION_ID;

export default awsConfig;