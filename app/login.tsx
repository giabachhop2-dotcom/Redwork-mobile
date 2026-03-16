import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Modal, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useBiometrics } from '../hooks/useBiometrics';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';
import { Image } from 'expo-image';

export default function LoginScreen() {
  const router = useRouter();
  const { isBiometricSupported, authenticate } = useBiometrics();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const openScanner = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    if (status === 'granted') {
      setScanned(false);
      setScanning(true);
    } else {
      Alert.alert('Permission Required', 'Camera permission is needed to scan QR codes.');
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
    else router.replace('/(tabs)');
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Account created! Check your email to verify.', [
        { text: 'OK', onPress: () => setIsSignUp(false) },
      ]);
    }
  };

  const handleBiometricLogin = async () => {
    const success = await authenticate();
    if (success) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('No Session', 'Please sign in with email first, then biometrics will be available for quick access.');
      }
    } else {
      Alert.alert('Failed', 'Biometric authentication failed.');
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setScanning(false);
    Alert.alert('QR Scanned', `Data: ${data}`);
  };

  return (
    <KeyboardAvoidingView style={s.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={s.flex1}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={s.logoContainer}>
          <Image
            source={require('../assets/images/icon.png')}
            style={s.logo}
            contentFit="contain"
          />
          <Text style={s.appName}>RedWork</Text>
          <Text style={s.subtitle}>
            {isSignUp ? 'Create your account' : 'Welcome back, professional.'}
          </Text>
        </View>

        {/* Form */}
        <View style={s.formContainer}>
          {isSignUp && (
            <TextInput
              style={s.input}
              placeholder="Full Name"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          )}
          <TextInput
            style={s.input}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <TextInput
            style={s.input}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />
          {!isSignUp && (
            <TouchableOpacity style={s.forgotRow}>
              <Text style={s.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main Button */}
        <TouchableOpacity
          onPress={isSignUp ? handleSignUp : handleLogin}
          disabled={loading}
          style={[s.mainButton, loading && s.buttonDisabled]}
          activeOpacity={0.85}
        >
          <Text style={s.mainButtonText}>
            {loading ? (isSignUp ? 'Creating...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign In')}
          </Text>
        </TouchableOpacity>

        {/* Social Login */}
        {!isSignUp && (
          <View style={s.socialRow}>
            {isBiometricSupported && (
              <TouchableOpacity style={s.socialBtn} onPress={handleBiometricLogin}>
                <Ionicons name="finger-print" size={28} color="#EF4444" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.socialBtn} onPress={openScanner}>
              <Ionicons name="qr-code" size={28} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn}>
              <Ionicons name="logo-google" size={24} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn}>
              <Ionicons name="logo-apple" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn}>
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
          </View>
        )}

        {/* Toggle Sign In / Sign Up */}
        <View style={s.toggleRow}>
          <Text style={s.toggleText}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          </Text>
          <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); setFullName(''); }}>
            <Text style={s.toggleLink}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal visible={scanning} animationType="slide" presentationStyle="pageSheet">
        <View style={s.scannerContainer}>
          {hasPermission && (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            >
              <View style={s.scannerOverlay}>
                <View style={s.scannerFrame} />
                <Text style={s.scannerLabel}>Scan QR to Login</Text>
                <TouchableOpacity onPress={() => setScanning(false)} style={s.scannerClose}>
                  <Ionicons name="close" size={30} color="white" />
                </TouchableOpacity>
              </View>
            </CameraView>
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex1: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28 },

  // Logo
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 88, height: 88, borderRadius: 22 },
  appName: { fontSize: 32, fontWeight: '800', color: '#1A237E', marginTop: 16, letterSpacing: -0.5 },
  subtitle: { color: '#9CA3AF', marginTop: 6, fontSize: 15 },

  // Form
  formContainer: { gap: 14 },
  input: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1A237E',
  },
  forgotRow: { alignItems: 'flex-end' },
  forgotText: { color: '#FF4444', fontWeight: '600', fontSize: 13 },

  // Main Button
  mainButton: {
    width: '100%',
    backgroundColor: '#FF4444',
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 24,
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  mainButtonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700', fontSize: 17 },

  // Social
  socialRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 32, gap: 14 },
  socialBtn: {
    width: 56,
    height: 56,
    backgroundColor: '#F3F4F6',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Toggle
  toggleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 32, marginBottom: 40 },
  toggleText: { color: '#9CA3AF', fontSize: 14 },
  toggleLink: { color: '#FF4444', fontWeight: '700', fontSize: 14 },

  // Scanner
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  scannerOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scannerFrame: { width: 256, height: 256, borderWidth: 2, borderColor: '#FFF', borderRadius: 16 },
  scannerLabel: {
    color: '#FFF', marginTop: 40, fontSize: 18, fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
  },
  scannerClose: { position: 'absolute', top: 48, right: 24, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },
});
