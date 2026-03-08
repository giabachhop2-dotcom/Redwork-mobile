import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Custom dark theme with RedWork branding
const RedWorkDark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#FF4444',
    background: '#000000',
    card: '#1C1C1E',
    border: '#2C2C2E',
  },
};

const RedWorkLight = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF4444',
    background: '#F2F2F7',
    card: '#FFFFFF',
    border: '#E5E5EA',
  },
};

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthProvider();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!session && !inAuthGroup) {
      // Not signed in, redirect to login
      router.replace('/login');
    } else if (session && inAuthGroup) {
      // Signed in, redirect to tabs
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const auth = useAuthProvider();

  useEffect(() => {
    if (!auth.loading) {
      SplashScreen.hideAsync();
    }
  }, [auth.loading]);

  return (
    <AuthContext.Provider value={auth}>
      <ThemeProvider value={colorScheme === 'dark' ? RedWorkDark : RedWorkLight}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="job/[id]"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', title: 'Modal' }}
          />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AuthContext.Provider>
  );
}
