import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  title?: string;
  role?: string;
  skills?: string[];
  location?: string;
  avatar_url?: string;
  company_name?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('id, email, full_name, title, role, skills, location, avatar_url, company_name')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data as UserProfile);
      }
    } catch (e) {
      console.warn('Failed to fetch profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <Text className="text-gray-400">Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center mt-8 mb-6">
          <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-4">
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} className="w-24 h-24 rounded-full" />
            ) : (
              <Ionicons name="person" size={48} color="#FF4444" />
            )}
          </View>
          <Text className="text-2xl font-bold text-navy dark:text-white">
            {profile?.full_name || 'No Name Set'}
          </Text>
          <Text className="text-gray-500 mt-1">{profile?.title || 'No title'}</Text>
          <View className="flex-row items-center mt-2">
            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-primary font-semibold text-sm capitalize">
                {profile?.role || 'talent'}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 mb-4">
          <ProfileRow icon="mail-outline" label="Email" value={profile?.email || '-'} />
          <ProfileRow icon="location-outline" label="Location" value={profile?.location || 'Not set'} />
          {profile?.company_name && (
            <ProfileRow icon="business-outline" label="Company" value={profile.company_name} />
          )}
        </View>

        {/* Skills */}
        {profile?.skills && profile.skills.length > 0 && (
          <View className="mb-4">
            <Text className="text-lg font-bold text-navy dark:text-white mb-3">Skills</Text>
            <View className="flex-row flex-wrap gap-2">
              {profile.skills.map((skill, i) => (
                <View key={i} className="bg-primary/10 px-3 py-1.5 rounded-full">
                  <Text className="text-primary font-medium text-sm">{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-red-50 dark:bg-red-900/20 py-4 rounded-2xl items-center mt-4 mb-10"
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text className="text-red-500 font-bold text-base">Sign Out</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center py-3 border-b border-gray-200/50 dark:border-gray-800/50 last:border-0">
      <Ionicons name={icon as any} size={20} color="#9CA3AF" />
      <Text className="text-gray-500 ml-3 w-20">{label}</Text>
      <Text className="text-navy dark:text-white font-medium flex-1 text-right">{value}</Text>
    </View>
  );
}
