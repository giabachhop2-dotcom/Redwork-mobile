import React, { useState, useEffect } from 'react';
import { View, Text, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';

interface JobPost {
  id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  budget_min?: number;
  budget_max?: number;
  contract_type?: string;
  created_at: string;
  is_featured?: boolean;
}

export default function PostsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<JobPost[]>([]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company, location, category, budget_min, budget_max, contract_type, created_at, is_featured')
        .eq('status', 'open')
        .order('is_featured', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(30);

      if (data && !error) {
        setPosts(data as JobPost[]);
      }
    } catch (e) {
      console.warn('Failed to fetch posts:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const renderPost = ({ item }: { item: JobPost }) => (
    <TouchableOpacity
      style={s.postCard}
      activeOpacity={0.7}
      onPress={() => router.push(`/job/${item.id}`)}
    >
      {item.is_featured && (
        <View style={s.featuredBadge}>
          <Ionicons name="star" size={10} color="#F59E0B" />
          <Text style={s.featuredText}>Nổi bật</Text>
        </View>
      )}

      <View style={s.postHeader}>
        <View style={s.avatarCircle}>
          <Text style={s.avatarText}>{item.company?.[0] || 'C'}</Text>
        </View>
        <View style={s.postHeaderInfo}>
          <Text style={s.companyName}>{item.company || 'Confidential'}</Text>
          <Text style={s.postTime}>{timeAgo(item.created_at)}</Text>
        </View>
      </View>

      <Text style={s.postTitle} numberOfLines={2}>{item.title}</Text>

      <View style={s.postMeta}>
        {item.location && (
          <View style={s.metaChip}>
            <Ionicons name="location-outline" size={12} color="#9CA3AF" />
            <Text style={s.metaText}>{item.location}</Text>
          </View>
        )}
        {item.category && (
          <View style={s.metaChip}>
            <Ionicons name="folder-outline" size={12} color="#9CA3AF" />
            <Text style={s.metaText}>{item.category}</Text>
          </View>
        )}
        {(item.budget_max || item.budget_min) && (
          <View style={s.metaChip}>
            <Ionicons name="cash-outline" size={12} color="#22C55E" />
            <Text style={[s.metaText, { color: '#22C55E', fontWeight: '600' }]}>
              {item.contract_type === 'Hourly'
                ? `$${item.budget_min || 0}-$${item.budget_max || 0}/hr`
                : `$${item.budget_max || item.budget_min || 0}`}
            </Text>
          </View>
        )}
      </View>

      <View style={s.postActions}>
        <TouchableOpacity style={s.actionBtn}>
          <Ionicons name="bookmark-outline" size={18} color="#9CA3AF" />
          <Text style={s.actionText}>Lưu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn}>
          <Ionicons name="share-outline" size={18} color="#9CA3AF" />
          <Text style={s.actionText}>Chia sẻ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, s.applyBtn]}>
          <Text style={s.applyText}>Ứng tuyển</Text>
          <Ionicons name="arrow-forward" size={14} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={s.emptyState}>
      <View style={s.emptyIcon}>
        <Ionicons name="document-text-outline" size={40} color="#D1D5DB" />
      </View>
      <Text style={s.emptyTitle}>Chưa có bài đăng</Text>
      <Text style={s.emptySubtitle}>Kéo xuống để làm mới hoặc quay lại sau.</Text>
    </View>
  );

  const SkeletonCard = () => (
    <View style={[s.postCard, { opacity: 0.5 }]}>
      <View style={s.postHeader}>
        <View style={[s.avatarCircle, { backgroundColor: '#E5E7EB' }]} />
        <View style={s.postHeaderInfo}>
          <View style={{ width: 100, height: 14, backgroundColor: '#E5E7EB', borderRadius: 6 }} />
          <View style={{ width: 50, height: 10, backgroundColor: '#E5E7EB', borderRadius: 6, marginTop: 4 }} />
        </View>
      </View>
      <View style={{ width: '80%', height: 18, backgroundColor: '#E5E7EB', borderRadius: 6, marginTop: 12 }} />
      <View style={{ width: '60%', height: 14, backgroundColor: '#E5E7EB', borderRadius: 6, marginTop: 8 }} />
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.headerSection}>
        <Text style={s.headerLabel}>Feed</Text>
        <Text style={s.headerTitle}>Bài đăng</Text>
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 16 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : posts.length === 0 ? (
        <EmptyState />
      ) : (
        <FlashList
          data={posts}
          renderItem={renderPost}
          estimatedItemSize={200}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF4444" />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerSection: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerLabel: { fontSize: 12, fontWeight: '500', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 2 },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#1A237E', letterSpacing: -0.5 },

  postCard: {
    marginHorizontal: 16, marginBottom: 12, backgroundColor: '#FFFFFF',
    borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  featuredBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 10 },
  featuredText: { fontSize: 11, fontWeight: '600', color: '#F59E0B' },

  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,68,68,0.1)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#FF4444' },
  postHeaderInfo: { flex: 1 },
  companyName: { fontSize: 14, fontWeight: '600', color: '#1A237E' },
  postTime: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  postTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginTop: 12, lineHeight: 23 },

  postMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F9FAFB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  metaText: { fontSize: 12, color: '#9CA3AF' },

  postActions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F9FAFB' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 8 },
  actionText: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  applyBtn: { marginLeft: 'auto', backgroundColor: 'rgba(255,68,68,0.08)', paddingHorizontal: 14, borderRadius: 10 },
  applyText: { fontSize: 13, color: '#FF4444', fontWeight: '600' },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyIcon: { width: 80, height: 80, backgroundColor: '#F3F4F6', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#9CA3AF', textAlign: 'center' },
  emptySubtitle: { color: '#9CA3AF', marginTop: 8, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },
});
