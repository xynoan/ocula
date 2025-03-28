import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, SafeAreaView, Modal, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { Client, Message } from 'paho-mqtt';

const { width, height } = Dimensions.get('window');

// AWS S3 Configuration
const AWS_BUCKET = "esp32cams";
const AWS_REGION = "ap-southeast-2";
const S3_BASE_URL = `https://${AWS_BUCKET}.s3.${AWS_REGION}.amazonaws.com`;

// MQTT Configuration
const MQTT_CONFIG = {
    host: 'k1d7d4f0.ala.eu-central-1.emqxsl.com',
    port: 8084,
    path: '/mqtt',
    clientId: 'Ocula_' + Math.random().toString(16).substr(2, 8),
    username: 'Roel', // HiveMQ publicRoel broker doesn't require credentials
    password: 'Roel',
    topic: 'control'
};

export default function CameraScreen() {
    const [ledState, setLedState] = useState(false);
    const [buzzerState, setBuzzerState] = useState(false);
    const [client, setClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [connecting, setConnecting] = useState(true);
  
    const cameraURL = "http://192.168.137.18/stream";

    const connectToMqtt = useCallback(() => {
        setConnecting(true);
        
        const mqttClient = new Client(
            MQTT_CONFIG.host,
            MQTT_CONFIG.port,
            MQTT_CONFIG.path,
            MQTT_CONFIG.clientId
        );

        mqttClient.onConnectionLost = (responseObject) => {
            if (responseObject.errorCode !== 0) {
                console.log('Connection lost:', responseObject.errorMessage);
                setIsConnected(false);
                Alert.alert(
                    "Connection Lost", 
                    "Lost connection to MQTT broker: " + responseObject.errorMessage,
                    [{ text: "OK" }]
                );
            }
        };

        mqttClient.onMessageArrived = (message) => {
            console.log('Message arrived:', message.payloadString);
        };

        const connectOptions = {
            onSuccess: () => {
                console.log('Connected to MQTT broker');
                setIsConnected(true);
                setConnecting(false);
                mqttClient.subscribe(MQTT_CONFIG.topic);
                setClient(mqttClient);
            },
            onFailure: (error: any) => {
                console.log('Connection failed:', error.errorMessage);
                Alert.alert("Connection Error", "Failed to connect to MQTT broker. Check your network connection.");
                setIsConnected(false);
                setConnecting(false);
            },
            userName: MQTT_CONFIG.username,
            password: MQTT_CONFIG.password,
            useSSL: true,
            timeout: 10, // Increased timeout
            keepAliveInterval: 30,
            reconnect: true,
            mqttVersion: 4 as 4
        };

        mqttClient.connect(connectOptions);
        
        return mqttClient;
    }, []);
    
    useEffect(() => {
        const mqttClient = connectToMqtt();

        return () => {
            if (mqttClient && typeof mqttClient.isConnected === 'function' && mqttClient.isConnected()) {
                mqttClient.disconnect();
            }
        };
    }, [connectToMqtt]);

    const handleReconnect = useCallback(() => {
        if (client && typeof client.isConnected === 'function' && client.isConnected()) {
            client.disconnect();
        }
        connectToMqtt();
    }, [client, connectToMqtt]);

    const sendCommand = useCallback((command: string) => {
        if (!client) {
            Alert.alert("Not Connected", "Please connect to MQTT broker first");
            return;
        }
        
        if (typeof client.isConnected === 'function' && client.isConnected()) {
            const payload = JSON.stringify({
                command: command,
                timestamp: new Date().toISOString()
            });
            
            const message = new Message(payload);
            message.destinationName = MQTT_CONFIG.topic;
            message.qos = 1;
            message.retained = false;
            
            try {
                client.send(message);
                console.log(`Command sent: ${command}`);
            } catch (error) {
                console.log('Error sending message:', error);
                Alert.alert(
                    "Send Error",
                    "Failed to send command. Check your connection.",
                    [{ text: "OK" }]
                );
            }
        } else {
            setIsConnected(false);
            Alert.alert(
                "Not Connected",
                "MQTT client is not connected. Try reconnecting.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Reconnect", onPress: handleReconnect }
                ]
            );
        }
    }, [client, handleReconnect]);

    const toggleLED = useCallback(() => {
        const newState = !ledState;
        setLedState(newState);
        sendCommand(newState ? 'led_on' : 'led_off');
    }, [ledState, sendCommand]);

    const toggleBuzzer = useCallback(() => {
        const newState = !buzzerState;
        setBuzzerState(newState);
        sendCommand(newState ? 'buzzer_on' : 'buzzer_off');
    }, [buzzerState, sendCommand]);

    const moveCamera = useCallback((direction: string) => {
        sendCommand(direction);
    }, [sendCommand]);

    const handleCapture = useCallback(() => {
        if (client && isConnected) {
            sendCommand('capture');
            
            setTimeout(() => {
                const now = new Date();
                const timestamp = now.toISOString()
                    .replace(/[:.]/g, '-')
                    .replace('T', '_')
                    .split('.')[0];
                const imageUrl = `${S3_BASE_URL}/Captured_Photos/capture_${timestamp}.jpg`;
                setCapturedImage(imageUrl);
                setShowImageModal(true);
            }, 2000);
        }
    }, [client, isConnected, sendCommand]);

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.videoContainer}>
                <WebView
                    source={{ uri: cameraURL }}
                    style={styles.video}
                    scrollEnabled={false}
                    bounces={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={false}
                    scalesPageToFit={true}
                    androidLayerType="hardware"
                    androidHardwareAccelerationDisabled={false}
                    cacheEnabled={false}
                />
            </View>

            <View style={styles.statusIndicator}>
                <View style={styles.connectionStatus}>
                    <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#00FF00' : '#FF0000' }]} />
                    <Text style={styles.statusText}>{isConnected ? 'Connected' : 'Disconnected'}</Text>
                </View>
                {!isConnected && !connecting && (
                    <TouchableOpacity style={styles.reconnectButton} onPress={handleReconnect}>
                        <Text style={styles.reconnectText}>Reconnect</Text>
                    </TouchableOpacity>
                )}
                {connecting && (
                    <Text style={styles.connectingText}>Connecting...</Text>
                )}
            </View>

            <View style={styles.mainControls}>
                <TouchableOpacity 
                    style={styles.controlButton} 
                    onPress={toggleLED}
                >
                    <MaterialIcons name="lightbulb" size={30} color={ledState ? "#FF0000" : "#FFF"} />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.captureButton} 
                    onPress={handleCapture}
                >
                    <MaterialIcons name="camera" size={40} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.controlButton} 
                    onPress={toggleBuzzer}
                >
                    <MaterialIcons name="alarm" size={30} color={buzzerState ? "#FF0000" : "#FFF"} />
                </TouchableOpacity>
            </View>

            <View style={styles.directionControls}>
                <TouchableOpacity 
                    style={styles.directionButton}
                    onPress={() => moveCamera('down')}
                >
                    <MaterialIcons name="keyboard-arrow-up" size={40} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.horizontalControls}>
                    <TouchableOpacity 
                        style={styles.directionButton}
                        onPress={() => moveCamera('left')}
                    >
                        <MaterialIcons name="keyboard-arrow-left" size={40} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.directionButton}
                        onPress={() => moveCamera('right')}
                    >
                        <MaterialIcons name="keyboard-arrow-right" size={40} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={styles.directionButton}
                    onPress={() => moveCamera('up')}
                >
                    <MaterialIcons name="keyboard-arrow-down" size={40} color="#FFF" />
                </TouchableOpacity>
            </View>

            <Modal
                visible={showImageModal}
                transparent={true}
                onRequestClose={() => setShowImageModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => setShowImageModal(false)}
                        >
                            <MaterialIcons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                        {capturedImage && (
                            <Image
                                source={{ uri: capturedImage }}
                                style={styles.capturedImage}
                                resizeMode="contain"
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    videoContainer: {
        width: width * 0.9,
        height: '40%' ,
        backgroundColor: "#000",
        overflow: "hidden",
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        
    },
    video: {
        flex: 1,
        backgroundColor: 'transparent',
        margin:0,
    },
    mainControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 30,
        paddingRight: 50,
        marginBottom: 5,
        
    },
    controlButton: {
        width: 50,
        height: 50,
        backgroundColor: '#333',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    captureButton: {
        width: 80,
        height: 80,
        backgroundColor: '#FF0000',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    directionControls: {
        alignItems: 'center',
        marginBottom: 200,
        
    },

    directionButton: {
        width: 60,
        height: 60,
        backgroundColor: '#333',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
        elevation: 5,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width * 0.9,
        height: height * 0.7,
        backgroundColor: '#000',
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        borderRadius: 20,
    },
    capturedImage: {
        width: '100%',
        height: '100%',
    },
    upButton: {
        marginBottom: 10,
    },
    
    horizontalControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
        marginBottom: 10,
    },
    leftButton: {
        marginRight: 20,
    },
    rightButton: {
        marginLeft: 20,
    },
    downButton: {
        
    },
    statusIndicator: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    connectionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    connectionDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    reconnectButton: {
        backgroundColor: '#3366FF',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 15,
    },
    reconnectText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFF',
    },
    connectingText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
});