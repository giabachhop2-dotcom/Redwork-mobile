import React from 'react';
import {
  View, Text, TouchableOpacity, Platform,
  ScrollView, Alert, Switch,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  // Not authenticated
  if (!user) {
    return (
      <View style={{
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: isDark ? '#000' : '#F2F2F7',
        paddingHorizontal: 40,
      }}>
        <Ionicons name="person-circle-outline" size={80} color="#9CA3AF" />
        <Text style={{
          fontSize: 22, fontWeight: '700',
          color: isDark ? '#FFF' : '#000',
          marginTop: 20,
        }}>
          Sign in to RedWork
        </Text>
        <Text style={{
          fontSize: 15, color: '#9CA3AF',
          textAlign: 'center', marginTop: 8, lineHeight: 22,
        }}>
          Track your applications, save jobs, and connect with employers.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/login')}
          style={{
            backgroundColor: '#FF4444',
            paddingHorizontal: 32, paddingVertical: 14,
            borderRadius: 14, marginTop: 24,
            shadowColor: '#FF4444',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3, shadowRadius: 8,
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#000' : '#F2F2F7' }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{
        paddingTop: Platform.OS === 'ios' ? 70 : 50,
        paddingBottom: 24,
        paddingHorizontal: 20,
      }}>
        <Text style={{
          fontSize: 32, fontWeight: '800',
          color: isDark ? '#FFF' : '#000',
          letterSpacing: -0.5,
        }}>
          Profile
        </Text>
      </View>

      {/* User Card */}
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 16,
            backgroundColor: isDark ? '#1C1C1E' : '#FFF',
            marginHorizontal: 16, padding: 20,
            borderRadius: 20,
            borderWidth: 1, borderColor: isDark ? '#2C2C2E' : '#F0F0F0',
          }}
        >
          {profile?.avatar_url ? (
            <Image
              source={profile.avatar_url}
              style={{ width: 64, height: 64, borderRadius: 20 }}
              contentFit="cover"
            />
          ) : (
            <View style={{
              width: 64, height: 64, borderRadius: 20,
              backgroundColor: '#FF4444',
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700' }}>{initials}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: isDark ? '#FFF' : '#1A1A1A' }}>
              {displayName}
            </Text>
            <Text style={{ fontSize: 14, color: '#9CA3AF', marginTop: 2 }}>
              {profile?.title || user.email}
            </Text>
            {profile?.role && (
              <View style={{
                backgroundColor: 'rgba(255, 68, 68, 0.1)',
                paddingHorizontal: 10, paddingVertical: 3,
                borderRadius: 8, alignSelf: 'flex-start', marginTop: 6,
              }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#FF4444', textTransform: 'capitalize' }}>
                  {profile.role}
                </Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Stats Row */}
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <View style={{
          flexDirection: 'row', gap: 10,
          marginHorizontal: 16, marginTop: 12,
        }}>
          <StatCard icon="document-text-outline" label="Applied" value="--" isDark={isDark} />
          <StatCard icon="bookmark-outline" label="Saved" value="--" isDark={isDark} />
          <StatCard icon="eye-outline" label="Views" value="--" isDark={isDark} />
        </View>
      </Animated.View>

      {/* Settings Section */}
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <Text style={{
          fontSize: 14, fontWeight: '600', color: '#9CA3AF',
          paddingHorizontal: 20, marginTop: 28, marginBottom: 8,
          textTransform: 'uppercase', letterSpacing: 1,
        }}>
          Settings
        </Text>
        <View style={{
          backgroundColor: isDark ? '#1C1C1E' : '#FFF',
          marginHorizontal: 16, borderRadius: 16,
          borderWidth: 1, borderColor: isDark ? '#2C2C2E' : '#F0F0F0',
          overflow: 'hidden',
        }}>
          <SettingsRow icon="person-outline" label="Edit Profile" isDark={isDark} />
          <Divider isDark={isDark} />
          <SettingsRow icon="notifications-outline" label="Notifications" isDark={isDark} />
          <Divider isDark={isDark} />
          <SettingsRow icon="language-outline" label="Language" isDark={isDark} value="English" />
          <Divider isDark={isDark} />
          <SettingsRow icon="shield-checkmark-outline" label="Privacy" isDark={isDark} />
        </View>
      </Animated.View>

      {/* About Section */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <Text style={{
          fontSize: 14, fontWeight: '600', color: '#9CA3AF',
          paddingHorizontal: 20, marginTop: 28, marginBottom: 8,
          textTransform: 'uppercase', letterSpacing: 1,
        }}>
          About
        </Text>
        <View style={{
          backgroundColor: isDark ? '#1C1C1E' : '#FFF',
          marginHorizontal: 16, borderRadius: 16,
          borderWidth: 1, borderColor: isDark ? '#2C2C2E' : '#F0F0F0',
          overflow: 'hidden',
        }}>
          <SettingsRow icon="help-circle-outline" label="Help & Support" isDark={isDark} />
          <Divider isDark={isDark} />
          <SettingsRow icon="star-outline" label="Rate RedWork" isDark={isDark} />
          <Divider isDark={isDark} />
          <SettingsRow icon="information-circle-outline" label="Version" isDark={isDark} value="1.0.0" showChevron={false} />
        </View>
      </Animated.View>

      {/* Sign Out */}
      <Animated.View entering={FadeInDown.delay(500).springify()}>
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            backgroundColor: isDark ? '#1C1C1E' : '#FFF',
            marginHorizontal: 16, marginTop: 20,
            borderRadius: 16, padding: 16,
            alignItems: 'center',
            borderWidth: 1, borderColor: isDark ? '#2C2C2E' : '#F0F0F0',
          }}
        >
          <Text style={{ color: '#FF4444', fontSize: 16, fontWeight: '600' }}>Sign Out</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, isDark }: { icon: any; label: string; value: string; isDark: boolean }) {
  return (
    <View style={{
      flex: 1, alignItems: 'center',
      backgroundColor: isDark ? '#1C1C1E' : '#FFF',
      paddingVertical: 16, borderRadius: 16,
      borderWidth: 1, borderColor: isDark ? '#2C2C2E' : '#F0F0F0',
    }}>
      <Ionicons name={icon} size={22} color="#FF4444" />
      <Text style={{ fontSize: 20, fontWeight: '700', color: isDark ? '#FFF' : '#000', marginTop: 6 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function SettingsRow({ icon, label, isDark, value, showChevron = true }: {
  icon: any; label: string; isDark: boolean; value?: string; showChevron?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
      }}
    >
      <Ionicons name={icon} size={22} color={isDark ? '#D1D5DB' : '#6B7280'} />
      <Text style={{
        flex: 1, marginLeft: 12, fontSize: 16,
        color: isDark ? '#FFF' : '#1A1A1A',
      }}>
        {label}
      </Text>
      {value && <Text style={{ fontSize: 15, color: '#9CA3AF', marginRight: 4 }}>{value}</Text>}
      {showChevron && <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />}
    </TouchableOpacity>
  );
}

function Divider({ isDark }: { isDark: boolean }) {
  return <View style={{ height: 0.5, backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0', marginLeft: 50 }} />;
}
