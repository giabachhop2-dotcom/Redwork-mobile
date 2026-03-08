import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Job } from '../types/database';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

interface JobCardProps {
  job: Job;
  timeAgo?: string;
  onPress: () => void;
}

export const JobCard = ({ job, timeAgo, onPress }: JobCardProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: isDark ? '#2C2C2E' : '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0 : 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Top Row: Logo + Title + Bookmark */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flexDirection: 'row', gap: 12, flex: 1 }}>
          <Image
            source={job.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company || 'C')}&background=FF4444&color=fff&bold=true`}
            style={{
              width: 48, height: 48, borderRadius: 14,
              backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
            }}
            contentFit="cover"
            transition={200}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16, fontWeight: '700',
                color: isDark ? '#FFFFFF' : '#1A1A1A',
                lineHeight: 22,
              }}
              numberOfLines={2}
            >
              {job.title}
            </Text>
            <Text style={{ fontSize: 14, color: '#9CA3AF', marginTop: 2 }}>
              {job.company}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => Haptics.selectionAsync()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="bookmark-outline" size={22} color={isDark ? '#6B7280' : '#9CA3AF'} />
        </TouchableOpacity>
      </View>

      {/* Tags */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        {job.type && (
          <View style={{
            backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
            paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
          }}>
            <Text style={{ fontSize: 12, fontWeight: '500', color: isDark ? '#D1D5DB' : '#6B7280' }}>
              {job.type}
            </Text>
          </View>
        )}
        {job.location && (
          <View style={{
            backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
            paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
          }}>
            <Text style={{ fontSize: 12, fontWeight: '500', color: isDark ? '#D1D5DB' : '#6B7280' }}>
              📍 {job.location}
            </Text>
          </View>
        )}
        {job.budget_max != null && job.budget_max > 0 && (
          <View style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
          }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#10B981' }}>
              ${job.budget_min ?? 0} - ${job.budget_max}
            </Text>
          </View>
        )}
        {job.experience_level && (
          <View style={{
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
          }}>
            <Text style={{ fontSize: 12, fontWeight: '500', color: '#6366F1' }}>
              {job.experience_level}
            </Text>
          </View>
        )}
      </View>

      {/* Footer: Time */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
          {timeAgo || 'Recently'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 12, color: '#FF4444', fontWeight: '600' }}>View Details</Text>
          <Ionicons name="chevron-forward" size={14} color="#FF4444" />
        </View>
      </View>
    </TouchableOpacity>
  );
};
