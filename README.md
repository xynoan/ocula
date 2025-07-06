# Ocula - IoT Security Monitoring System

**Ocula** is a comprehensive IoT security monitoring application that combines computer vision, cloud services, and hardware control to provide intelligent surveillance and access control.

## 🚀 Features

### 📹 **Real-time Camera Control**
- Live video streaming from ESP32 camera module
- Remote camera movement control (pan/tilt)
- LED and buzzer control for alerts
- Image capture with automatic cloud storage

### 🛡️ **Face Recognition Security**
- AWS Rekognition-powered face detection and recognition
- Face registration and management system
- Duplicate face detection prevention
- Secure face data storage in AWS S3

### 🔐 **User Authentication**
- Firebase Authentication integration
- Secure user registration and login
- Password reset functionality
- OTP verification system

### 📱 **Mobile Interface**
- React Native cross-platform app
- Intuitive swipe-based navigation
- Real-time MQTT communication
- Responsive UI with bottom sheet design

### ☁️ **Cloud Integration**
- AWS S3 for image storage with presigned URLs
- AWS Rekognition for face analysis
- Firebase Firestore for user data
- MQTT broker for real-time IoT communication

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Native  │    │   Node.js API    │    │   ESP32 Camera  │
│   Mobile App    │◄──►│    Backend       │    │    Module       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Firebase      │    │   AWS Services   │    │   MQTT Broker   │
│   Auth/Firestore│    │   S3/Rekognition │    │   (HiveMQ)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### **Frontend (Mobile App)**
- **React Native** with Expo Router
- **TypeScript** for type safety
- **Expo Camera** for camera functionality
- **React Navigation** for navigation
- **Reanimated 2** for smooth animations
- **Bottom Sheet** for UI interactions

### **Backend**
- **Node.js** with Express
- **Firebase Admin SDK** for authentication
- **Nodemailer** for email notifications
- **CORS** for cross-origin requests

### **Cloud Services**
- **AWS S3** - Image storage and management
- **AWS Rekognition** - Face detection and recognition
- **Firebase Auth** - User authentication
- **Firebase Firestore** - Database
- **HiveMQ** - MQTT broker for IoT communication

### **Hardware**
- **ESP32** microcontroller
- **Camera module** with pan/tilt servo motors
- **LED** and **Buzzer** for alerts

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- AWS Account with S3 and Rekognition access
- Firebase project
- ESP32 development environment

## 🚀 Installation & Setup

### 1. **Clone the Repository**
```bash
git clone <repository-url>
cd ocula
```

### 2. **Install Frontend Dependencies**
```bash
npm install
```

### 3. **Install Backend Dependencies**
```bash
cd backend
npm install
cd ..
```

### 4. **Configure Environment Variables**

Create a `.env` file in the backend directory:
```env
# Firebase
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_CLIENT_ID=your-client-id

# Email Configuration
EMAIL_USER=your-smtp-email
EMAIL_PASS=your-smtp-password
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587

# Server Configuration
PORT=3000
```

### 5. **Configure Firebase**
Update `firebaseConfig.ts` with your Firebase configuration:
```typescript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 6. **Configure AWS**
Update `app/screens/aws/config.tsx` with your AWS credentials:
```typescript
export const AWS_CONFIG = {
  region: 'your-aws-region',
  accessKeyId: 'your-access-key-id',
  secretAccessKey: 'your-secret-access-key'
};

export const BUCKET_NAME = 'your-s3-bucket-name';
export const COLLECTION_ID = 'your-rekognition-collection-id';
```

### 7. **Configure ESP32 Camera**
Update the camera URL in `app/screens/CameraScreen.tsx`:
```typescript
const cameraURL = "http://YOUR_ESP32_IP/stream";
```

### 8. **Start the Backend Server**
```bash
cd backend
npm run dev
```

### 9. **Start the Mobile App**
```bash
npm start
```

## 📱 Usage Guide

### **Getting Started**
1. **Register/Login** - Create an account or sign in with existing credentials
2. **Setup Profile** - Complete your profile setup with personal information
3. **Grant Permissions** - Allow camera access for face registration

### **Main Interface**
The app features a bottom sheet navigation with four main sections:

#### 🎥 **Camera Control**
- **Live Stream**: View real-time video from your ESP32 camera
- **Movement Control**: Use directional buttons to pan/tilt the camera
- **LED Control**: Toggle LED light on/off
- **Buzzer Control**: Activate/deactivate buzzer alerts
- **Capture**: Take photos that are automatically stored in AWS S3

#### 🖼️ **Images Gallery**
- View captured images from your camera
- Browse historical captures
- Image management tools

#### 🛡️ **Security (Shield)**
- **Face Registration**: Register authorized faces for access control
- **Face Management**: View and delete registered faces
- **Notification Settings**: Configure entrance and entity alerts
- **Activity Logs**: Monitor security events

#### 👤 **Profile**
- User account management
- App settings and preferences
- Security configurations

### **Face Registration Process**
1. Navigate to the Shield screen
2. Tap "Register New Face"
3. Position face in camera viewfinder
4. Tap capture button
5. System automatically:
   - Uploads image to S3
   - Detects face using AWS Rekognition
   - Checks for duplicates
   - Stores face data securely

## 🔧 Development

### **Project Structure**
```
ocula/
├── app/                    # React Native app source
│   ├── screens/           # App screens
│   │   ├── aws/          # AWS service integrations
│   │   ├── utils/        # Utility functions
│   │   └── *.tsx         # Screen components
│   ├── _layout.tsx       # App layout configuration
│   └── *.tsx             # Main app files
├── backend/              # Node.js backend
│   ├── server.js         # Express server
│   └── package.json      # Backend dependencies
├── assets/               # Static assets
├── types/                # TypeScript type definitions
└── package.json          # Frontend dependencies
```

### **Key Components**

#### **CameraScreen.tsx**
- Handles real-time video streaming via WebView
- MQTT communication for hardware control
- Image capture and S3 upload functionality

#### **ShieldScreen.tsx**
- Face registration and management
- AWS Rekognition integration
- Security settings and notifications

#### **AWS Services**
- `aws/s3.tsx` - S3 operations (upload, delete, presigned URLs)
- `aws/rekognition.tsx` - Face detection and recognition
- `aws/config.tsx` - AWS service configuration

### **MQTT Commands**
The app communicates with ESP32 via MQTT using these commands:
- `led_on/led_off` - Control LED
- `buzzer_on/buzzer_off` - Control buzzer
- `up/down/left/right` - Camera movement
- `capture` - Trigger photo capture

## 🐛 Troubleshooting

### **Common Issues**

#### **MQTT Connection Failed**
- Check network connectivity
- Verify MQTT broker credentials
- Ensure ESP32 is connected to the network

#### **Camera Stream Not Loading**
- Verify ESP32 IP address is correct
- Check if camera module is properly connected
- Ensure firewall allows camera stream port

#### **Face Registration Fails**
- Ensure good lighting conditions
- Verify face is clearly visible and properly positioned
- Check AWS Rekognition service permissions

#### **AWS Services Not Working**
- Verify AWS credentials are correctly configured
- Check IAM permissions for S3 and Rekognition
- Ensure AWS region is correct

### **Debug Mode**
Enable debug logging by setting environment variables:
```bash
export DEBUG=true
export LOG_LEVEL=debug
```

## 📞 Support

For technical support or questions:
- Check the troubleshooting section above
- Review AWS and Firebase documentation
- Ensure all services are properly configured

## 🔐 Security Notes

- Store AWS credentials securely
- Use IAM roles with minimal required permissions
- Enable MFA on AWS and Firebase accounts
- Regularly rotate access keys
- Keep dependencies updated

## 📄 License

This project is private and confidential.

---

**Ocula** - Intelligent IoT Security Monitoring System