import React, { useState, useEffect } from 'react';
import { View, Text, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { JobCard } from '@/components/JobCard';
import { JobCardSkeleton } from '@/components/JobCardSkeleton';
import { Job } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
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
    <View style={s.emptyState}>
      <Ionicons name="briefcase-outline" size={64} color="#D1D5DB" />
      <Text style={s.emptyTitle}>No Jobs Found</Text>
      <Text style={s.emptySubtitle}>Pull down to refresh or check back later for new opportunities.</Text>
    </View>
  );

  const Header = () => (
    <View style={s.header}>
      <View style={s.headerTop}>
        <View>
          <Text style={s.headerLabel}>Discover</Text>
          <Text style={s.headerTitle}>Jobs</Text>
        </View>
        <TouchableOpacity style={s.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={s.searchBar}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <Text style={s.searchPlaceholder}>Search for jobs, skills...</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <Header />
      {loading ? (
        <View style={s.skeletonContainer}>
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </View>
      ) : jobs.length === 0 ? (
        <EmptyState />
      ) : (
        <FlashList
          data={jobs}
          renderItem={({ item }) => <JobCard job={item} onPress={() => {}} />}
          estimatedItemSize={150}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF4444" />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerLabel: { fontSize: 12, fontWeight: '500', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 2 },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#1A237E', letterSpacing: -0.5 },
  notifBtn: { width: 40, height: 40, backgroundColor: '#F3F4F6', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14 },
  searchPlaceholder: { marginLeft: 8, color: '#9CA3AF', fontSize: 15 },
  skeletonContainer: { paddingHorizontal: 16, paddingTop: 16 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#9CA3AF', marginTop: 16 },
  emptySubtitle: { color: '#9CA3AF', marginTop: 8, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },
});
