import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Modal, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useBiometrics } from '../hooks/useBiometrics';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const { isBiometricSupported, authenticate } = useBiometrics();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
    else router.replace('/(tabs)');
  };

  const handleBiometricLogin = async () => {
    // Implement biometric auth logic
    const success = await authenticate();
    if (success) {
      Alert.alert("Success", "Authenticated via Biometrics");
      router.replace('/(tabs)');
    } else {
        Alert.alert("Failed", "Biometric authentication failed");
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
    setScanned(true);
    setScanning(false);
    Alert.alert('QR Scanned', `Data: ${data}`);
    // Handle the token from QR code here
  };

  return (
    <View className="flex-1 bg-white dark:bg-black justify-center px-6">
      <View className="items-center mb-10 mt-20">
        <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-4 shadow-lg shadow-primary/30">
           <Ionicons name="briefcase" size={40} color="white" />
        </View>
        <Text className="text-3xl font-bold text-navy dark:text-white">RedWork</Text>
        <Text className="text-gray-500 mt-2">Welcome back, professional.</Text>
      </View>

      <View className="space-y-4">
        <TextInput
          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-base"
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-base"
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity className="items-end">
            <Text className="text-primary font-medium">Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        className="w-full bg-primary py-4 rounded-xl mt-8 shadow-lg shadow-primary/30 active:scale-95 transition-all"
      >
        <Text className="text-white text-center font-bold text-lg">
          {loading ? 'Logging in...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-8 gap-6">
        <TouchableOpacity 
          onPress={handleBiometricLogin}
          className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center active:bg-gray-200"
        >
          <Ionicons name="finger-print" size={28} color="#EF4444" />
        </TouchableOpacity>
        
        <TouchableOpacity 
            onPress={() => {
                setScanned(false);
                setScanning(true);
            }}
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
      </View>

      <View className="flex-row justify-center mt-10 mb-10">
        <Text className="text-gray-500">Don't have an account? </Text>
        <TouchableOpacity>
            <Text className="text-primary font-bold">Sign Up</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={scanning} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-black">
            {hasPermission && (
                <CameraView 
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                >
                     <View className="flex-1 items-center justify-center bg-transparent">
                        <View className="w-64 h-64 border-2 border-white rounded-xl bg-transparent" />
                        <Text className="text-white mt-10 text-lg font-medium bg-black/50 px-4 py-2 rounded-lg">Scan QR to Login</Text>
                        
                        <TouchableOpacity 
                            onPress={() => setScanning(false)}
                            className="absolute top-12 right-6 bg-black/50 p-2 rounded-full"
                        >
                            <Ionicons name="close" size={30} color="white" />
                        </TouchableOpacity>
                    </View>
                </CameraView>
            )}
             {!hasPermission && (
                <View className="flex-1 bg-black justify-center items-center">
                    <Text className="text-white">No Camera Permission</Text>
                     <TouchableOpacity 
                        onPress={() => setScanning(false)}
                        className="mt-4 bg-white px-6 py-3 rounded-full"
                    >
                        <Text className="font-bold text-black">Close</Text>
                    </TouchableOpacity>
                </View>
             )}
        </View>
      </Modal>
    </View>
  );
}
