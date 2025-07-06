# Ocula Setup Guide

This guide provides detailed instructions for setting up all components of the Ocula IoT Security Monitoring System.

## 🔧 Hardware Setup

### ESP32 Camera Module Setup

#### **Required Components**
- ESP32-CAM module
- FTDI programmer or ESP32-CAM-MB module
- Servo motors (2x SG90 for pan/tilt)
- LED module
- Buzzer module
- Jumper wires
- Power supply (5V 2A recommended)

#### **Wiring Diagram**
```
ESP32-CAM Pin Connections:
├── IO12 → Servo 1 (Pan) Signal Pin
├── IO13 → Servo 2 (Tilt) Signal Pin
├── IO14 → LED Positive
├── IO15 → Buzzer Positive
├── GND → Ground (All components)
└── 5V → Power (Servos, LED, Buzzer)
```

#### **ESP32 Code Setup**
1. Install Arduino IDE
2. Add ESP32 board manager: `https://dl.espressif.com/dl/package_esp32_index.json`
3. Install required libraries:
   - WiFi
   - WebServer
   - ESP32Servo
   - PubSubClient (MQTT)
4. Upload the camera firmware with MQTT control

## ☁️ AWS Configuration

### **Step 1: Create AWS Account**
1. Sign up for AWS account at [aws.amazon.com](https://aws.amazon.com)
2. Enable billing alerts
3. Create IAM user with programmatic access

### **Step 2: Configure IAM Permissions**
Create an IAM policy with the following permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "rekognition:DetectFaces",
                "rekognition:IndexFaces",
                "rekognition:SearchFacesByImage",
                "rekognition:DeleteFaces",
                "rekognition:CreateCollection",
                "rekognition:ListCollections"
            ],
            "Resource": "*"
        }
    ]
}
```

### **Step 3: Setup S3 Bucket**
1. Create a new S3 bucket with a unique name
2. Configure bucket settings:
   - **Block public access**: Keep enabled for security
   - **Versioning**: Enable for backup
   - **Encryption**: Enable server-side encryption
3. Create folder structure:
   ```
   your-bucket/
   ├── Captured_Photos/
   ├── Registered_Faces/
   └── Logs/
   ```

### **Step 4: Setup Rekognition Collection**
1. Go to AWS CLI or use SDK
2. Create collection:
   ```bash
   aws rekognition create-collection --collection-id your-collection-name
   ```
3. Note the collection ARN for configuration

### **Step 5: Get AWS Credentials**
1. Go to IAM → Users → Your User → Security Credentials
2. Create new access key
3. Download and save securely:
   - Access Key ID
   - Secret Access Key
   - Region

## 🔥 Firebase Configuration

### **Step 1: Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project
3. Enable Google Analytics (optional)

### **Step 2: Setup Authentication**
1. Go to Authentication → Sign-in method
2. Enable Email/Password provider
3. Configure email templates (optional)
4. Set up OAuth consent screen if needed

### **Step 3: Setup Firestore Database**
1. Go to Firestore Database
2. Create database in production mode
3. Configure security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /faces/{faceId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### **Step 4: Get Firebase Configuration**
1. Go to Project Settings → General
2. Scroll to "Your apps" section
3. Add web app
4. Copy configuration object:
   ```javascript
   {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   }
   ```

### **Step 5: Setup Service Account**
1. Go to Project Settings → Service accounts
2. Generate new private key
3. Download JSON file
4. Extract required fields for backend configuration

## 📧 Email Configuration

### **Step 1: Choose Email Provider**
Recommended providers:
- **Gmail** (for development)
- **SendGrid** (for production)
- **AWS SES** (for AWS integration)

### **Step 2: Gmail Setup (Development)**
1. Enable 2-factor authentication
2. Generate app password:
   - Go to Google Account settings
   - Security → App passwords
   - Generate password for "Mail"
3. Use these settings:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

### **Step 3: Production Email Setup**
For production, use dedicated email service:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

## 🌐 MQTT Broker Setup

### **Option 1: HiveMQ Cloud (Recommended)**
1. Sign up at [HiveMQ Cloud](https://www.hivemq.com/mqtt-cloud-broker/)
2. Create cluster
3. Configure credentials
4. Get connection details:
   ```javascript
   {
     host: 'your-cluster.hivemq.cloud',
     port: 8883,
     username: 'your-username',
     password: 'your-password'
   }
   ```

### **Option 2: Self-hosted MQTT**
1. Install Mosquitto broker
2. Configure SSL certificates
3. Setup authentication
4. Open firewall ports (1883, 8883)

## 📱 Mobile App Configuration

### **Step 1: Install Dependencies**
```bash
npm install -g @expo/cli
cd ocula
npm install
```

### **Step 2: Configure Environment**
Create `.env` file in root directory:
```env
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id

# AWS
EXPO_PUBLIC_AWS_REGION=your-region
EXPO_PUBLIC_AWS_BUCKET=your-bucket-name
EXPO_PUBLIC_AWS_COLLECTION_ID=your-collection-id

# ESP32
EXPO_PUBLIC_ESP32_IP=192.168.1.100
```

### **Step 3: Update Configuration Files**
1. Update `firebaseConfig.ts`
2. Update `app/screens/aws/config.tsx`
3. Update camera URL in `CameraScreen.tsx`

## 🖥️ Backend Server Setup

### **Step 1: Install Dependencies**
```bash
cd backend
npm install
```

### **Step 2: Configure Environment**
Create `backend/.env`:
```env
# Server
PORT=3000
NODE_ENV=production

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# CORS
ALLOWED_ORIGINS=http://localhost:19006,http://localhost:8081
```

### **Step 3: Start Server**
```bash
npm run dev
```

## ✅ Testing Setup

### **Step 1: Test Backend**
```bash
curl http://localhost:3000/health
```

### **Step 2: Test Mobile App**
```bash
expo start
```

### **Step 3: Test ESP32 Connection**
1. Check camera stream: `http://ESP32_IP/stream`
2. Test MQTT connection
3. Verify hardware controls

### **Step 4: Test Cloud Services**
1. Register test face
2. Capture test image
3. Check S3 storage
4. Verify Rekognition processing

## 🚨 Security Checklist

- [ ] AWS credentials stored securely
- [ ] Firebase security rules configured
- [ ] HTTPS enabled for production
- [ ] Strong passwords used
- [ ] 2FA enabled on all accounts
- [ ] Regular security updates
- [ ] Network firewall configured
- [ ] ESP32 firmware secured

## 📊 Monitoring Setup

### **AWS CloudWatch**
1. Enable logging for S3 and Rekognition
2. Set up billing alerts
3. Monitor API usage

### **Firebase Analytics**
1. Enable Analytics in Firebase
2. Track user engagement
3. Monitor authentication events

## 🔄 Backup Strategy

### **Regular Backups**
- Export Firestore data weekly
- Backup S3 bucket to another region
- Save configuration files securely
- Document hardware setup

### **Disaster Recovery**
- Test restore procedures
- Maintain hardware spares
- Document recovery steps
- Keep offline backups

---

**Next**: Return to main [README.md](./README.md) for usage instructions.