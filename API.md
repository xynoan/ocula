# Ocula API Documentation

This document describes the REST API endpoints available in the Ocula backend server.

## 🔗 Base URL

```
http://localhost:3000  (Development)
https://your-domain.com  (Production)
```

## 🔐 Authentication

The API uses Firebase Authentication. Include the Firebase ID token in the Authorization header:

```http
Authorization: Bearer <firebase_id_token>
```

### Getting Authentication Token
```javascript
// Frontend (React Native)
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;
const token = await user.getIdToken();
```

## 📋 API Endpoints

### **Health Check**

#### `GET /health`
Check if the server is running.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### **User Management**

#### `POST /api/users/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "firebase_user_id",
  "user": {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Email already in use",
  "code": "auth/email-already-in-use"
}
```

---

#### `GET /api/users/profile`
Get current user profile information.

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": "firebase_user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "profilePicture": "https://s3-url/profile.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "lastLogin": "2024-01-15T15:45:00.000Z"
  }
}
```

---

#### `PUT /api/users/profile`
Update user profile information.

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+1987654321",
  "preferences": {
    "notifications": true,
    "theme": "dark"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "uid": "firebase_user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "phoneNumber": "+1987654321",
    "updatedAt": "2024-01-15T16:00:00.000Z"
  }
}
```

---

### **Face Recognition**

#### `POST /api/faces/register`
Register a new face for recognition.

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
image: <file>  // Image file (JPEG/PNG)
name: "John Doe"  // Optional name for the face
```

**Response:**
```json
{
  "success": true,
  "message": "Face registered successfully",
  "faceId": "rekognition_face_id",
  "s3Key": "Registered_Faces/face_uuid.jpg",
  "confidence": 99.8,
  "boundingBox": {
    "Width": 0.2,
    "Height": 0.3,
    "Left": 0.4,
    "Top": 0.2
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "No face detected in image",
  "details": "Please ensure the image contains a clear, visible face"
}
```

---

#### `GET /api/faces`
Get all registered faces for the current user.

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
```

**Response:**
```json
{
  "success": true,
  "faces": [
    {
      "faceId": "rekognition_face_id_1",
      "name": "John Doe",
      "s3Key": "Registered_Faces/face_uuid_1.jpg",
      "imageUrl": "https://presigned-s3-url/image1.jpg",
      "registeredAt": "2024-01-15T10:30:00.000Z",
      "confidence": 99.8
    },
    {
      "faceId": "rekognition_face_id_2",
      "name": "Jane Smith",
      "s3Key": "Registered_Faces/face_uuid_2.jpg",
      "imageUrl": "https://presigned-s3-url/image2.jpg",
      "registeredAt": "2024-01-14T14:20:00.000Z",
      "confidence": 98.5
    }
  ],
  "count": 2
}
```

---

#### `DELETE /api/faces/:faceId`
Delete a registered face.

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
```

**Parameters:**
- `faceId` - The Rekognition face ID

**Response:**
```json
{
  "success": true,
  "message": "Face deleted successfully",
  "deletedFaceId": "rekognition_face_id"
}
```

---

#### `POST /api/faces/search`
Search for a face in registered faces collection.

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
image: <file>  // Image file to search
threshold: 90  // Optional confidence threshold (default: 80)
```

**Response:**
```json
{
  "success": true,
  "matches": [
    {
      "faceId": "rekognition_face_id",
      "name": "John Doe",
      "confidence": 95.7,
      "similarity": 98.2
    }
  ],
  "matchFound": true
}
```

---

### **Camera & Images**

#### `GET /api/images`
Get all captured images for the current user.

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
```

**Query Parameters:**
- `limit` (optional) - Number of images to return (default: 50)
- `offset` (optional) - Pagination offset (default: 0)
- `startDate` (optional) - Filter from date (ISO string)
- `endDate` (optional) - Filter to date (ISO string)

**Response:**
```json
{
  "success": true,
  "images": [
    {
      "imageId": "uuid",
      "s3Key": "Captured_Photos/capture_timestamp.jpg",
      "imageUrl": "https://presigned-s3-url/image.jpg",
      "capturedAt": "2024-01-15T15:30:00.000Z",
      "metadata": {
        "cameraId": "esp32_cam_01",
        "fileSize": 245678,
        "dimensions": {
          "width": 640,
          "height": 480
        }
      }
    }
  ],
  "totalCount": 125,
  "hasMore": true
}
```

---

#### `POST /api/images/upload`
Upload a captured image.

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
image: <file>  // Image file
cameraId: "esp32_cam_01"  // Optional camera identifier
timestamp: "2024-01-15T15:30:00.000Z"  // Optional custom timestamp
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "imageId": "uuid",
  "s3Key": "Captured_Photos/capture_timestamp.jpg",
  "imageUrl": "https://presigned-s3-url/image.jpg"
}
```

---

#### `DELETE /api/images/:imageId`
Delete a captured image.

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
```

**Parameters:**
- `imageId` - The image UUID

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully",
  "deletedImageId": "uuid"
}
```

---

### **Notifications**

#### `POST /api/notifications/send`
Send a notification (used by system for alerts).

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "security_alert",
  "title": "Unknown Person Detected",
  "message": "An unregistered face was detected at the entrance",
  "priority": "high",
  "metadata": {
    "cameraId": "esp32_cam_01",
    "imageUrl": "https://s3-url/detected_face.jpg",
    "timestamp": "2024-01-15T15:30:00.000Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "notificationId": "uuid",
  "sentAt": "2024-01-15T15:30:00.000Z"
}
```

---

#### `GET /api/notifications`
Get user notifications.

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
```

**Query Parameters:**
- `limit` (optional) - Number of notifications (default: 20)
- `unreadOnly` (optional) - Get only unread notifications (default: false)

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "notificationId": "uuid",
      "type": "security_alert",
      "title": "Unknown Person Detected",
      "message": "An unregistered face was detected",
      "priority": "high",
      "read": false,
      "createdAt": "2024-01-15T15:30:00.000Z",
      "metadata": {
        "cameraId": "esp32_cam_01",
        "imageUrl": "https://s3-url/image.jpg"
      }
    }
  ],
  "unreadCount": 3
}
```

---

#### `PUT /api/notifications/:notificationId/read`
Mark a notification as read.

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### **System Logs**

#### `GET /api/logs`
Get system activity logs.

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
```

**Query Parameters:**
- `type` (optional) - Log type filter (camera, face_recognition, system)
- `level` (optional) - Log level (info, warning, error)
- `limit` (optional) - Number of logs (default: 100)
- `startDate` (optional) - Filter from date
- `endDate` (optional) - Filter to date

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "logId": "uuid",
      "type": "face_recognition",
      "level": "info",
      "message": "Face registered successfully",
      "timestamp": "2024-01-15T15:30:00.000Z",
      "metadata": {
        "userId": "firebase_user_id",
        "faceId": "rekognition_face_id",
        "confidence": 99.8
      }
    }
  ],
  "totalCount": 1250
}
```

---

## 🚫 Error Handling

### **Standard Error Response Format**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details",
  "timestamp": "2024-01-15T15:30:00.000Z"
}
```

### **HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

### **Common Error Codes**
- `AUTH_REQUIRED` - Authentication token required
- `AUTH_INVALID` - Invalid authentication token
- `USER_NOT_FOUND` - User does not exist
- `FACE_NOT_DETECTED` - No face found in image
- `FACE_ALREADY_EXISTS` - Face already registered
- `IMAGE_TOO_LARGE` - Image file size exceeds limit
- `INVALID_IMAGE_FORMAT` - Unsupported image format
- `AWS_SERVICE_ERROR` - AWS service error
- `FIREBASE_ERROR` - Firebase service error

---

## 📊 Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per minute
- **Image upload**: 10 requests per minute
- **Face registration**: 5 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642251600
```

---

## 🔧 Development Tools

### **Testing with cURL**

```bash
# Health check
curl -X GET http://localhost:3000/health

# Get user profile
curl -X GET \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  http://localhost:3000/api/users/profile

# Upload image
curl -X POST \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  http://localhost:3000/api/images/upload
```

### **Using Postman**
1. Import the collection (if available)
2. Set up environment variables:
   - `baseUrl`: `http://localhost:3000`
   - `authToken`: Your Firebase ID token
3. Configure authentication in collection settings

---

**Next**: Return to main [README.md](./README.md) for complete documentation.