import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';

type Screen = 'login' | 'home' | 'camera' | 'biometric';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [biometricResult, setBiometricResult] = useState<string>('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentScreen('home');
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Social Login', `${provider} login will be available soon.`);
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required for KYC verification.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library permission is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleBiometricAuth = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      setBiometricResult('Biometric hardware not available on this device.');
      return;
    }
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      setBiometricResult('No biometric credentials enrolled.');
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify your identity',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    if (result.success) {
      setBiometricResult('Biometric authentication successful!');
    } else {
      setBiometricResult('Biometric authentication failed.');
    }
  };

  const handleUploadDocument = () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please take a photo or select an image first.');
      return;
    }
    Alert.alert('Success', 'Document uploaded successfully for KYC review.');
    setSelectedImage(null);
  };

  if (currentScreen === 'login') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image source={require('./assets/icon.png')} style={styles.logo} />
            <Text style={styles.title}>BitcoinPayKYC</Text>
            <Text style={styles.subtitle}>Identity Verification</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.socialButton]}
              onPress={() => handleSocialLogin('Google')}
            >
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.socialButton]}
              onPress={() => handleSocialLogin('Apple')}
            >
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'camera') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.screenTitle}>Document Upload</Text>
          <Text style={styles.description}>
            Upload your identity document for KYC verification.
          </Text>

          <View style={styles.imageContainer}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.preview} />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>No image selected</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handlePickImage}>
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>
          {selectedImage && (
            <TouchableOpacity style={[styles.button, styles.uploadButton]} onPress={handleUploadDocument}>
              <Text style={styles.buttonText}>Upload Document</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'biometric') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.scrollContent}>
          <Text style={styles.screenTitle}>Biometric Verification</Text>
          <Text style={styles.description}>
            Verify your identity using Face ID or Touch ID.
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleBiometricAuth}>
            <Text style={styles.buttonText}>Authenticate with Biometrics</Text>
          </TouchableOpacity>

          {biometricResult ? (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>{biometricResult}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>KYC Verification</Text>
        <Text style={styles.description}>
          Complete your identity verification to use BitcoinPay services.
        </Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.card} onPress={() => setCurrentScreen('camera')}>
            <Text style={styles.cardIcon}>📷</Text>
            <Text style={styles.cardTitle}>Document Upload</Text>
            <Text style={styles.cardDescription}>
              Upload ID card, passport, or driver's license
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => setCurrentScreen('biometric')}>
            <Text style={styles.cardIcon}>🔐</Text>
            <Text style={styles.cardTitle}>Biometric Verification</Text>
            <Text style={styles.cardDescription}>
              Verify with Face ID or Touch ID
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => Alert.alert('OCR', 'OCR document scanning coming soon.')}>
            <Text style={styles.cardIcon}>📄</Text>
            <Text style={styles.cardTitle}>OCR Scanning</Text>
            <Text style={styles.cardDescription}>
              Automatic text recognition from documents
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            setCurrentScreen('login');
            setEmail('');
            setPassword('');
          }}
        >
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3a3a5e',
  },
  button: {
    backgroundColor: '#f7931a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  socialButton: {
    backgroundColor: '#2a2a4e',
    borderWidth: 1,
    borderColor: '#3a3a5e',
  },
  socialButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3a3a5e',
  },
  dividerText: {
    color: '#666',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 30,
  },
  cardContainer: {
    gap: 16,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#2a2a4e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#3a3a5e',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  preview: {
    width: 300,
    height: 225,
    borderRadius: 12,
  },
  placeholder: {
    width: 300,
    height: 225,
    borderRadius: 12,
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3a3a5e',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#f7931a',
  },
  uploadButton: {
    backgroundColor: '#27ae60',
  },
  backButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#f7931a',
    fontSize: 16,
  },
  resultContainer: {
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  resultText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  logoutButton: {
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
});
