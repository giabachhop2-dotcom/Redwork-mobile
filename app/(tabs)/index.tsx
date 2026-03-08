import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, RefreshControl, TouchableOpacity,
  Platform, StyleSheet, TextInput, ScrollView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { JobCard } from '@/components/JobCard';
import { JobCardSkeleton } from '@/components/JobCardSkeleton';
import { Job } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

const CATEGORIES = ['All', '🖥 Tech', '🎨 Design', '📊 Marketing', '🌍 Remote', '💼 Finance', '📱 Mobile'];
const PAGE_SIZE = 20;

export default function JobFeedScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchJobs = useCallback(async (pageNum = 0, isRefresh = false) => {
    try {
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (selectedCategory !== 'All') {
        const cat = selectedCategory.replace(/^[^\w]+\s/, '');
        query = query.ilike('category', `%${cat}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (isRefresh || pageNum === 0) {
        setJobs(data || []);
      } else {
        setJobs(prev => [...prev, ...(data || [])]);
      }
      setHasMore((data?.length || 0) === PAGE_SIZE);
    } catch (e) {
      console.error('Failed to fetch jobs:', e);
    }
  }, [selectedCategory]);

  const fetchFeatured = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'approved')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(5);
      setFeaturedJobs(data || []);
    } catch (e) {
      console.error('Failed to fetch featured:', e);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setPage(0);
      await Promise.all([fetchJobs(0, true), fetchFeatured()]);
      setLoading(false);
    };
    load();
  }, [selectedCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPage(0);
    await Promise.all([fetchJobs(0, true), fetchFeatured()]);
    setRefreshing(false);
  }, [fetchJobs, fetchFeatured]);

  const onEndReached = useCallback(async () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchJobs(nextPage);
  }, [page, hasMore, loading, fetchJobs]);

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const HeaderComponent = () => (
    <View>
      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{
            fontSize: 18, fontWeight: '700',
            color: isDark ? '#FFF' : '#000',
            paddingHorizontal: 20, marginBottom: 12,
          }}>
            ⭐ Featured
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {featuredJobs.map((job, i) => (
              <TouchableOpacity
                key={job.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  router.push(`/job/${job.id}`);
                }}
                activeOpacity={0.8}
                style={{
                  width: 280,
                  backgroundColor: isDark ? '#1C1C1E' : '#FFF',
                  borderRadius: 20,
                  padding: 20,
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: isDark ? '#2C2C2E' : '#F0F0F0',
                  shadowColor: '#FF4444',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                }}
              >
                <View style={{
                  backgroundColor: '#FF4444',
                  paddingHorizontal: 10, paddingVertical: 4,
                  borderRadius: 8, alignSelf: 'flex-start',
                  marginBottom: 12,
                }}>
                  <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700' }}>FEATURED</Text>
                </View>
                <Text style={{
                  fontSize: 17, fontWeight: '700',
                  color: isDark ? '#FFF' : '#1A1A1A',
                  marginBottom: 6,
                }} numberOfLines={2}>
                  {job.title}
                </Text>
                <Text style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 12 }}>
                  {job.company}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{
                    backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                  }}>
                    <Text style={{ fontSize: 12, color: isDark ? '#D1D5DB' : '#6B7280' }}>
                      {job.location || 'Remote'}
                    </Text>
                  </View>
                  {job.budget_max && (
                    <View style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                    }}>
                      <Text style={{ fontSize: 12, color: '#10B981', fontWeight: '600' }}>
                        ${job.budget_min}-${job.budget_max}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Section Title */}
      <Text style={{
        fontSize: 18, fontWeight: '700',
        color: isDark ? '#FFF' : '#000',
        paddingHorizontal: 20, marginBottom: 8,
      }}>
        Recent Jobs
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#F2F2F7' }}>
      {/* Sticky Header */}
      <View style={{
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 12,
        paddingHorizontal: 20,
        backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(242,242,247,0.95)',
        zIndex: 10,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Discover
            </Text>
            <Text style={{ fontSize: 32, fontWeight: '800', color: isDark ? '#FFF' : '#000', letterSpacing: -0.5 }}>
              Jobs
            </Text>
          </View>
          <TouchableOpacity
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: isDark ? '#1C1C1E' : '#FFF',
              justifyContent: 'center', alignItems: 'center',
              borderWidth: 1, borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
            }}
          >
            <Ionicons name="notifications-outline" size={22} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>
        </View>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedCategory(cat);
                }}
                style={{
                  paddingHorizontal: 16, paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: isActive ? '#FF4444' : (isDark ? '#1C1C1E' : '#FFF'),
                  borderWidth: isActive ? 0 : 1,
                  borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
                }}
              >
                <Text style={{
                  fontSize: 13, fontWeight: '600',
                  color: isActive ? '#FFF' : (isDark ? '#D1D5DB' : '#6B7280'),
                }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Job List */}
      {loading ? (
        <View style={{ paddingTop: 16, paddingHorizontal: 4 }}>
          {[0, 1, 2, 3].map(i => <JobCardSkeleton key={i} />)}
        </View>
      ) : jobs.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <Ionicons name="search-outline" size={64} color="#9CA3AF" />
          <Text style={{ fontSize: 20, fontWeight: '700', color: isDark ? '#FFF' : '#000', marginTop: 16 }}>
            No jobs found
          </Text>
          <Text style={{ fontSize: 15, color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>
            Try a different category or pull down to refresh.
          </Text>
        </View>
      ) : (
        <FlashList
          data={jobs}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
              <JobCard
                job={item}
                timeAgo={getTimeAgo(item.created_at)}
                onPress={() => {
                  Haptics.selectionAsync();
                  router.push(`/job/${item.id}`);
                }}
              />
            </Animated.View>
          )}
          estimatedItemSize={160}
          ListHeaderComponent={HeaderComponent}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF4444" />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
