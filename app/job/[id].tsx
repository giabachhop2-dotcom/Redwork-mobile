import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Share,
  Platform, Dimensions, Alert, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Job } from '@/types/database';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();
      if (data) setJob(data as Job);
      setLoading(false);
    })();
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to apply for jobs.', [
        { text: 'Cancel' },
        { text: 'Sign In', onPress: () => router.push('/login') },
      ]);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setApplying(true);
    try {
      const { error } = await supabase.from('applications').insert({
        job_id: id,
        user_id: user.id,
        status: 'pending',
      });
      if (error) throw error;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Applied! 🎉', 'Your application has been submitted successfully.');
    } catch (e: any) {
      if (e?.code === '23505') {
        Alert.alert('Already Applied', 'You have already applied for this job.');
      } else {
        Alert.alert('Error', 'Failed to apply. Please try again.');
      }
    } finally {
      setApplying(false);
    }
  };

  const handleShare = async () => {
    if (!job) return;
    Haptics.selectionAsync();
    await Share.share({
      title: job.title,
      message: `Check out this job: ${job.title} at ${job.company} on RedWork!`,
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000' : '#F2F2F7' }}>
        <ActivityIndicator size="large" color="#FF4444" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000' : '#F2F2F7' }}>
        <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
        <Text style={{ fontSize: 18, fontWeight: '600', color: isDark ? '#FFF' : '#000', marginTop: 16 }}>
          Job not found
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#FF4444', fontSize: 16, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#F2F2F7' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)}>
          <View style={{
            backgroundColor: isDark ? '#1C1C1E' : '#FFF',
            paddingTop: Platform.OS === 'ios' ? 60 : 40,
            paddingBottom: 24,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}>
            {/* Nav Bar */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <TouchableOpacity
                onPress={() => { Haptics.selectionAsync(); router.back(); }}
                style={{
                  width: 40, height: 40, borderRadius: 14,
                  backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
                  justifyContent: 'center', alignItems: 'center',
                }}
              >
                <Ionicons name="chevron-back" size={22} color={isDark ? '#FFF' : '#000'} />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={handleShare}
                  style={{
                    width: 40, height: 40, borderRadius: 14,
                    backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
                    justifyContent: 'center', alignItems: 'center',
                  }}
                >
                  <Ionicons name="share-outline" size={20} color={isDark ? '#FFF' : '#000'} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => Haptics.selectionAsync()}
                  style={{
                    width: 40, height: 40, borderRadius: 14,
                    backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
                    justifyContent: 'center', alignItems: 'center',
                  }}
                >
                  <Ionicons name="bookmark-outline" size={20} color={isDark ? '#FFF' : '#000'} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Company Info */}
            <View style={{ alignItems: 'center' }}>
              <Image
                source={job.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company || 'C')}&background=FF4444&color=fff&bold=true&size=128`}
                style={{
                  width: 72, height: 72, borderRadius: 20,
                  backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
                }}
                contentFit="cover"
              />
              <Text style={{
                fontSize: 22, fontWeight: '800',
                color: isDark ? '#FFF' : '#1A1A1A',
                marginTop: 16, textAlign: 'center',
                lineHeight: 28,
              }}>
                {job.title}
              </Text>
              <Text style={{ fontSize: 16, color: '#9CA3AF', marginTop: 6 }}>
                {job.company}
              </Text>

              {/* Tags Row */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' }}>
                {job.location && <Tag icon="location-outline" text={job.location} />}
                {job.type && <Tag icon="time-outline" text={job.type} />}
                {job.experience_level && <Tag icon="trending-up-outline" text={job.experience_level} />}
              </View>

              {/* Salary */}
              {job.budget_max != null && job.budget_max > 0 && (
                <View style={{
                  marginTop: 16,
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  paddingHorizontal: 20, paddingVertical: 10,
                  borderRadius: 14,
                }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#10B981' }}>
                    ${job.budget_min ?? 0} - ${job.budget_max}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={{
            backgroundColor: isDark ? '#1C1C1E' : '#FFF',
            marginTop: 12, marginHorizontal: 16,
            borderRadius: 20, padding: 20,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? '#FFF' : '#1A1A1A', marginBottom: 12 }}>
              Description
            </Text>
            <Text style={{
              fontSize: 15, lineHeight: 24,
              color: isDark ? '#D1D5DB' : '#4B5563',
            }}>
              {job.description || 'No description provided.'}
            </Text>
          </View>
        </Animated.View>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <View style={{
              backgroundColor: isDark ? '#1C1C1E' : '#FFF',
              marginTop: 12, marginHorizontal: 16,
              borderRadius: 20, padding: 20,
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? '#FFF' : '#1A1A1A', marginBottom: 12 }}>
                Requirements
              </Text>
              {job.requirements.map((req, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <Text style={{ color: '#FF4444', fontSize: 16 }}>•</Text>
                  <Text style={{ fontSize: 15, color: isDark ? '#D1D5DB' : '#4B5563', flex: 1, lineHeight: 22 }}>
                    {req}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <View style={{
              backgroundColor: isDark ? '#1C1C1E' : '#FFF',
              marginTop: 12, marginHorizontal: 16,
              borderRadius: 20, padding: 20,
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? '#FFF' : '#1A1A1A', marginBottom: 12 }}>
                Benefits
              </Text>
              {job.benefits.map((b, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <Text style={{ color: '#10B981', fontSize: 16 }}>✓</Text>
                  <Text style={{ fontSize: 15, color: isDark ? '#D1D5DB' : '#4B5563', flex: 1, lineHeight: 22 }}>
                    {b}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Sticky Apply Bar */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        paddingTop: 12, paddingHorizontal: 20,
      }}>
        {Platform.OS === 'ios' && (
          <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={{
            ...StyleSheet.absoluteFillObject,
            borderTopLeftRadius: 20, borderTopRightRadius: 20,
            overflow: 'hidden',
          }} />
        )}
        <TouchableOpacity
          onPress={handleApply}
          disabled={applying}
          activeOpacity={0.8}
          style={{
            backgroundColor: '#FF4444',
            paddingVertical: 16,
            borderRadius: 16,
            shadowColor: '#FF4444',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Text style={{ color: '#FFF', textAlign: 'center', fontWeight: '700', fontSize: 17 }}>
            {applying ? 'Submitting...' : 'Apply Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Tag({ icon, text }: { icon: any; text: string }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
      paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
    }}>
      <Ionicons name={icon} size={14} color={isDark ? '#D1D5DB' : '#6B7280'} />
      <Text style={{ fontSize: 13, color: isDark ? '#D1D5DB' : '#6B7280', fontWeight: '500' }}>{text}</Text>
    </View>
  );
}
