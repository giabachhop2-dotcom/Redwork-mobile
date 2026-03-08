import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useBiometrics } from '../hooks/useBiometrics';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { isBiometricSupported, authenticate } = useBiometrics();
  const { signIn, signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isSignUp) {
      const { error } = await signUp(email, password, fullName);
      setLoading(false);
      if (error) {
        Alert.alert('Sign Up Failed', error);
      } else {
        Alert.alert('Welcome!', 'Check your email to verify your account.', [
          { text: 'OK', onPress: () => setIsSignUp(false) },
        ]);
      }
    } else {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Sign In Failed', error);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      }
    }
  };

  const handleBiometricLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const success = await authenticate();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Failed', 'Biometric authentication failed');
    }
  };

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    setScanned(true);
    setScanning(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('QR Scanned', `Token: ${data.substring(0, 20)}...`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Background Gradient */}
          <View style={StyleSheet.absoluteFill}>
            <View style={{
              position: 'absolute', top: -100, left: -50,
              width: 300, height: 300, borderRadius: 150,
              backgroundColor: 'rgba(255, 68, 68, 0.15)',
            }} />
            <View style={{
              position: 'absolute', bottom: -50, right: -80,
              width: 250, height: 250, borderRadius: 125,
              backgroundColor: 'rgba(255, 68, 68, 0.08)',
            }} />
          </View>

          <View style={{ paddingHorizontal: 24, paddingTop: 80 }}>
            {/* Logo */}
            <Animated.View entering={FadeInUp.delay(100).springify()} style={{ alignItems: 'center', marginBottom: 48 }}>
              <View style={{
                width: 80, height: 80, borderRadius: 24,
                backgroundColor: '#FF4444',
                justifyContent: 'center', alignItems: 'center',
                shadowColor: '#FF4444', shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
              }}>
                <Ionicons name="briefcase" size={40} color="white" />
              </View>
              <Text style={{
                fontSize: 32, fontWeight: '800', color: '#FFF',
                marginTop: 16, letterSpacing: -0.5,
              }}>
                RedWork
              </Text>
              <Text style={{ fontSize: 16, color: '#9CA3AF', marginTop: 6 }}>
                {isSignUp ? 'Create your account' : 'Welcome back, professional.'}
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#6B7280"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {!isSignUp && (
                <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 8 }}>
                  <Text style={{ color: '#FF4444', fontWeight: '600', fontSize: 14 }}>Forgot Password?</Text>
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Submit Button */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <TouchableOpacity
                onPress={handleAuth}
                disabled={loading}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#FF4444',
                  paddingVertical: 16,
                  borderRadius: 16,
                  marginTop: 16,
                  shadowColor: '#FF4444',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <Text style={{
                  color: '#FFF', textAlign: 'center',
                  fontWeight: '700', fontSize: 17,
                }}>
                  {loading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Create Account' : 'Sign In')}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            {!isSignUp && (
              <Animated.View entering={FadeInDown.delay(400).springify()}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 28 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#2C2C2E' }} />
                  <Text style={{ color: '#6B7280', paddingHorizontal: 16, fontSize: 13 }}>or continue with</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#2C2C2E' }} />
                </View>

                {/* Social Auth Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
                  {isBiometricSupported && (
                    <SocialButton icon="finger-print" onPress={handleBiometricLogin} />
                  )}
                  <SocialButton icon="qr-code" onPress={() => { setScanned(false); setScanning(true); }} />
                  <SocialButton icon="logo-google" onPress={() => Alert.alert('Coming Soon', 'Google Sign In coming soon')} />
                  <SocialButton icon="logo-apple" onPress={() => Alert.alert('Coming Soon', 'Apple Sign In coming soon')} />
                </View>
              </Animated.View>
            )}

            {/* Toggle Sign Up / Sign In */}
            <Animated.View entering={FadeInDown.delay(500).springify()}>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32, marginBottom: 40 }}>
                <Text style={{ color: '#9CA3AF', fontSize: 15 }}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                </Text>
                <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); Haptics.selectionAsync(); }}>
                  <Text style={{ color: '#FF4444', fontWeight: '700', fontSize: 15 }}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* QR Scanner Modal */}
      <Modal visible={scanning} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{
                width: 250, height: 250,
                borderWidth: 2, borderColor: '#FF4444',
                borderRadius: 20, backgroundColor: 'transparent',
              }} />
              <Text style={{
                color: '#FFF', marginTop: 24, fontSize: 17,
                fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.6)',
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
              }}>
                Scan QR to Login
              </Text>
              <TouchableOpacity
                onPress={() => setScanning(false)}
                style={{
                  position: 'absolute', top: 56, right: 20,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  width: 40, height: 40, borderRadius: 20,
                  justifyContent: 'center', alignItems: 'center',
                }}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>
    </View>
  );
}

function SocialButton({ icon, onPress }: { icon: any; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        width: 56, height: 56, borderRadius: 16,
        backgroundColor: '#1C1C1E',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#2C2C2E',
      }}
    >
      <Ionicons name={icon} size={24} color="#FFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFF',
  },
});
