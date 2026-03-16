import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, StyleSheet } from 'react-native';
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
      <View style={s.loadingContainer}>
        <Text style={s.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.profileHeader}>
          <View style={s.avatarContainer}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={s.avatar} />
            ) : (
              <Ionicons name="person" size={48} color="#FF4444" />
            )}
          </View>
          <Text style={s.userName}>{profile?.full_name || 'No Name Set'}</Text>
          <Text style={s.userTitle}>{profile?.title || 'No title'}</Text>
          <View style={s.roleBadgeRow}>
            <View style={s.roleBadge}>
              <Text style={s.roleBadgeText}>{profile?.role || 'talent'}</Text>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={s.infoCard}>
          <ProfileRow icon="mail-outline" label="Email" value={profile?.email || '-'} />
          <ProfileRow icon="location-outline" label="Location" value={profile?.location || 'Not set'} />
          {profile?.company_name && (
            <ProfileRow icon="business-outline" label="Company" value={profile.company_name} />
          )}
        </View>

        {/* Skills */}
        {profile?.skills && profile.skills.length > 0 && (
          <View style={s.skillsSection}>
            <Text style={s.skillsTitle}>Skills</Text>
            <View style={s.skillsRow}>
              {profile.skills.map((skill, i) => (
                <View key={i} style={s.skillBadge}>
                  <Text style={s.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <TouchableOpacity onPress={handleSignOut} style={s.signOutBtn} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Ionicons name={icon as any} size={20} color="#9CA3AF" />
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1, paddingHorizontal: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  loadingText: { color: '#9CA3AF', fontSize: 15 },

  // Header
  profileHeader: { alignItems: 'center', marginTop: 32, marginBottom: 24 },
  avatarContainer: {
    width: 96, height: 96, backgroundColor: 'rgba(255,68,68,0.1)', borderRadius: 48,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  userName: { fontSize: 24, fontWeight: '700', color: '#1A237E' },
  userTitle: { color: '#9CA3AF', marginTop: 4, fontSize: 15 },
  roleBadgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  roleBadge: { backgroundColor: 'rgba(255,68,68,0.1)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  roleBadgeText: { color: '#FF4444', fontWeight: '600', fontSize: 13, textTransform: 'capitalize' },

  // Info
  infoCard: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 20, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E5E7EB40' },
  infoLabel: { color: '#9CA3AF', marginLeft: 12, width: 80, fontSize: 14 },
  infoValue: { color: '#1A237E', fontWeight: '500', flex: 1, textAlign: 'right', fontSize: 14 },

  // Skills
  skillsSection: { marginBottom: 16 },
  skillsTitle: { fontSize: 18, fontWeight: '700', color: '#1A237E', marginBottom: 12 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { backgroundColor: 'rgba(255,68,68,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  skillText: { color: '#FF4444', fontWeight: '500', fontSize: 13 },

  // Sign Out
  signOutBtn: {
    backgroundColor: '#FEF2F2', paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', marginTop: 16, marginBottom: 40, flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  signOutText: { color: '#EF4444', fontWeight: '700', fontSize: 16 },
});
