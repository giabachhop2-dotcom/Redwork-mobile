import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/utils/supabase';
import { Job } from '@/types/database';
import { JobCard } from '@/components/JobCard';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

const TRENDING = [
  { label: 'React Native', icon: '📱', query: 'react native' },
  { label: 'UI/UX Design', icon: '🎨', query: 'design' },
  { label: 'Data Science', icon: '📊', query: 'data science' },
  { label: 'DevOps', icon: '🔧', query: 'devops' },
  { label: 'Marketing', icon: '📣', query: 'marketing' },
  { label: 'Remote', icon: '🌍', query: 'remote' },
  { label: 'AI / ML', icon: '🤖', query: 'artificial intelligence' },
  { label: 'Blockchain', icon: '⛓️', query: 'blockchain' },
];

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Job[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setHasSearched(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'approved')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(30);

      setResults(data || []);
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setSearching(false);
    }
  }, []);

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return days < 30 ? `${days}d ago` : `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#F2F2F7' }}>
      {/* Header */}
      <View style={{
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(242,242,247,0.95)',
      }}>
        <Text style={{
          fontSize: 32, fontWeight: '800',
          color: isDark ? '#FFF' : '#000',
          letterSpacing: -0.5, marginBottom: 16,
        }}>
          Explore
        </Text>

        {/* Search Bar */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: isDark ? '#1C1C1E' : '#FFF',
          borderRadius: 14, paddingHorizontal: 14,
          borderWidth: 1, borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
        }}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={{
              flex: 1, paddingVertical: 14,
              marginLeft: 10, fontSize: 16,
              color: isDark ? '#FFF' : '#000',
            }}
            placeholder="Search jobs, skills, companies..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => search(query)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setHasSearched(false); setResults([]); }}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Trending Categories */}
        {!hasSearched && (
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={{
              fontSize: 18, fontWeight: '700',
              color: isDark ? '#FFF' : '#000',
              paddingHorizontal: 20, marginTop: 8, marginBottom: 16,
            }}>
              🔥 Trending
            </Text>
            <View style={{
              flexDirection: 'row', flexWrap: 'wrap',
              gap: 10, paddingHorizontal: 20,
            }}>
              {TRENDING.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => { setQuery(item.query); search(item.query); }}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    backgroundColor: isDark ? '#1C1C1E' : '#FFF',
                    paddingHorizontal: 14, paddingVertical: 10,
                    borderRadius: 14,
                    borderWidth: 1, borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: isDark ? '#D1D5DB' : '#4B5563' }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Search Results */}
        {searching && (
          <View style={{ paddingTop: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FF4444" />
            <Text style={{ color: '#9CA3AF', marginTop: 12, fontSize: 15 }}>Searching...</Text>
          </View>
        )}

        {hasSearched && !searching && results.length === 0 && (
          <View style={{ paddingTop: 60, alignItems: 'center', paddingHorizontal: 40 }}>
            <Ionicons name="search-outline" size={64} color="#9CA3AF" />
            <Text style={{ fontSize: 20, fontWeight: '700', color: isDark ? '#FFF' : '#000', marginTop: 16 }}>
              No results
            </Text>
            <Text style={{ fontSize: 15, color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>
              Try different keywords or explore trending categories.
            </Text>
          </View>
        )}

        {hasSearched && !searching && results.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={{
              fontSize: 14, fontWeight: '600', color: '#9CA3AF',
              paddingHorizontal: 20, marginBottom: 12,
            }}>
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </Text>
            {results.map((job, index) => (
              <Animated.View key={job.id} entering={FadeInDown.delay(index * 40).springify()}>
                <JobCard
                  job={job}
                  timeAgo={getTimeAgo(job.created_at)}
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.push(`/job/${job.id}`);
                  }}
                />
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
