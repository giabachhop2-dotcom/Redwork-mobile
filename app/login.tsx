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

  // Camera permission on-demand only
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
      // Check if there's an existing session
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
    <KeyboardAvoidingView className="flex-1 bg-white dark:bg-black" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View className="items-center mb-10">
          <Image
            source={require('../assets/images/icon.png')}
            style={{ width: 80, height: 80, borderRadius: 20 }}
            contentFit="contain"
          />
          <Text className="text-3xl font-bold text-navy dark:text-white mt-4">RedWork</Text>
          <Text className="text-gray-500 mt-2">
            {isSignUp ? 'Create your account' : 'Welcome back, professional.'}
          </Text>
        </View>

        {/* Form */}
        <View className="gap-3">
          {isSignUp && (
            <TextInput
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 text-base text-navy dark:text-white"
              placeholder="Full Name"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          )}
          <TextInput
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 text-base text-navy dark:text-white"
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <TextInput
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 text-base text-navy dark:text-white"
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />
          {!isSignUp && (
            <TouchableOpacity className="items-end">
              <Text className="text-primary font-medium">Forgot Password?</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main Button */}
        <TouchableOpacity
          onPress={isSignUp ? handleSignUp : handleLogin}
          disabled={loading}
          className="w-full bg-primary py-4 rounded-xl mt-6 shadow-lg shadow-primary/30 active:scale-95"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          <Text className="text-white text-center font-bold text-lg">
            {loading ? (isSignUp ? 'Creating...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign In')}
          </Text>
        </TouchableOpacity>

        {/* Social Login (only for sign in) */}
        {!isSignUp && (
          <View className="flex-row justify-center mt-8 gap-4">
            {isBiometricSupported && (
              <TouchableOpacity
                onPress={handleBiometricLogin}
                className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center active:bg-gray-200"
              >
                <Ionicons name="finger-print" size={28} color="#EF4444" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={openScanner}
              className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center active:bg-gray-200"
            >
              <Ionicons name="qr-code" size={28} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center active:bg-gray-200">
              <Ionicons name="logo-google" size={24} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center active:bg-gray-200">
              <Ionicons name="logo-apple" size={24} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center active:bg-gray-200">
              <Ionicons name="logo-facebook" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}

        {/* Toggle Sign In / Sign Up */}
        <View className="flex-row justify-center mt-8 mb-10">
          <Text className="text-gray-500">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          </Text>
          <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); setFullName(''); }}>
            <Text className="text-primary font-bold">{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal visible={scanning} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-black">
          {hasPermission && (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            >
              <View className="flex-1 items-center justify-center bg-transparent">
                <View className="w-64 h-64 border-2 border-white rounded-xl bg-transparent" />
                <Text className="text-white mt-10 text-lg font-medium bg-black/50 px-4 py-2 rounded-lg">
                  Scan QR to Login
                </Text>
                <TouchableOpacity
                  onPress={() => setScanning(false)}
                  className="absolute top-12 right-6 bg-black/50 p-2 rounded-full"
                >
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
