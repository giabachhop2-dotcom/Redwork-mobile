import React, { useState, useEffect } from 'react';
import { View, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { JobCard } from '@/components/JobCard';
import { JobCardSkeleton } from '@/components/JobCardSkeleton';
import { Job } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { supabase } from '../../utils/supabase';

export default function JobFeedScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company, location, type, description, category, budget_min, budget_max, hourly_rate_min, hourly_rate_max, created_at, is_sponsored, status')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && !error) {
        setJobs(data as Job[]);
      }
    } catch (e) {
      console.warn('Failed to fetch jobs:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const EmptyState = () => (
    <View className="flex-1 justify-center items-center py-20">
      <Ionicons name="briefcase-outline" size={64} color="#D1D5DB" />
      <Text className="text-xl font-bold text-gray-400 mt-4">No Jobs Found</Text>
      <Text className="text-gray-400 mt-2 text-center px-8">Pull down to refresh or check back later for new opportunities.</Text>
    </View>
  );

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
      ) : jobs.length === 0 ? (
        <View className="mt-32">
          <EmptyState />
        </View>
      ) : (
        <FlashList
          data={jobs}
          renderItem={({ item }) => <JobCard job={item} onPress={() => {}} />}
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
