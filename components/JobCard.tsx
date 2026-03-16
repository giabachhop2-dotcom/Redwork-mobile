import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Job } from '../../types/database';

interface JobCardProps {
  job: Job;
  onPress: () => void;
}

export const JobCard = ({ job, onPress }: JobCardProps) => {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={s.card}>
      <View style={s.topRow}>
        <View style={s.companyRow}>
          <Image
            source={job.logo_url || 'https://ui-avatars.com/api/?name=' + job.company}
            style={s.companyLogo}
            contentFit="cover"
            transition={200}
          />
          <View style={s.companyInfo}>
            <Text style={s.jobTitle} numberOfLines={1}>{job.title}</Text>
            <Text style={s.companyName}>{job.company}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={s.tagsRow}>
        <View style={s.tag}>
          <Text style={s.tagText}>{job.type}</Text>
        </View>
        <View style={s.tag}>
          <Text style={s.tagText}>{job.location}</Text>
        </View>
        {job.budget_max && (
          <View style={s.salaryTag}>
            <Text style={s.salaryText}>
              ${job.budget_min} - ${job.budget_max}
            </Text>
          </View>
        )}
      </View>

      <View style={s.footer}>
        <Text style={s.footerText}>Posted 2h ago</Text>
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  companyRow: { flexDirection: 'row', gap: 12, flex: 1 },
  companyLogo: { width: 48, height: 48, borderRadius: 12 },
  companyInfo: { flex: 1 },
  jobTitle: { fontWeight: '700', fontSize: 17, color: '#1A237E' },
  companyName: { color: '#9CA3AF', fontSize: 14, marginTop: 2 },
  tagsRow: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { fontSize: 12, color: '#4B5563' },
  salaryTag: { backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  salaryText: { fontSize: 12, color: '#15803D', fontWeight: '500' },
  footer: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 12, color: '#9CA3AF' },
});
