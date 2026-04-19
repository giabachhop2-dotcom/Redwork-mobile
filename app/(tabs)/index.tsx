import React, { useState, useEffect } from 'react';
import { View, Text, RefreshControl, Platform, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { JobCard } from '@/components/JobCard';
import { JobCardSkeleton } from '@/components/JobCardSkeleton';
import { Job } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// Dummy Data for Preview
const DUMMY_JOBS: Job[] = Array.from({ length: 10 }).map((_, i) => ({
  id: String(i),
  title: i % 2 === 0 ? 'Senior React Native Developer' : 'UI/UX Designer',
  company: i % 2 === 0 ? 'Tech Corp' : 'Design Studio',
  location: 'Remote',
  type: 'Full-time',
  description: 'Great job...',
  is_sponsored: i === 0,
  created_at: new Date().toISOString(),
  category: 'Tech',
  budget_min: 50,
  budget_max: 100,
  hourly_rate_min: 50,
  hourly_rate_max: 100,
}));

export default function JobFeedScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    // Simulate initial load
    setTimeout(() => {
      setJobs(DUMMY_JOBS);
      setLoading(false);
    }, 2000);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Header Component
  const Header = () => (
    <BlurView intensity={80} tint="light" className="absolute top-0 left-0 right-0 z-10 px-6 pt-14 pb-4 overflow-hidden border-b border-gray-200/50 dark:border-gray-800/50">
      <View className="flex-row justify-between items-center mb-4">
        <View>
             <Text className="text-sm font-medium text-gray-500 uppercase tracking-widest">Discover</Text>
             <Text className="text-3xl font-extrabold text-navy dark:text-white tracking-tight">Jobs</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center">
             <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center bg-gray-100/80 dark:bg-gray-800/80 rounded-xl px-4 py-3">
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <Text className="ml-2 text-gray-400">Search for jobs, skills...</Text>
      </View>
    </BlurView>
  );

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <Header />
      {loading ? (
        <View className="mt-32 px-4">
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
        </View>
      ) : (
        <FlashList
          data={jobs}
          renderItem={({ item }) => <JobCard job={item} onPress={() => {}} />}
          // @ts-ignore
          estimatedItemSize={150}
          contentContainerStyle={{ paddingTop: 140, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF4444" progressViewOffset={140} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
