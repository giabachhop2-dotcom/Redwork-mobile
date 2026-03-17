import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../utils/supabase';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export default function NotificationsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<any>(null);

  const fetchNotifications = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('id, user_id, title, message, type, is_read, link, created_at')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data && !error) {
        setNotifications(data as Notification[]);
      }
    } catch (e) {
      console.warn('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

    if (user) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id);
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    const days = Math.floor(hrs / 24);
    return `${days} ngày trước`;
  };

  const getTypeIcon = (type: string): { name: string; color: string; bg: string } => {
    switch (type) {
      case 'success': return { name: 'checkmark-circle', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' };
      case 'error': return { name: 'alert-circle', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' };
      case 'warning': return { name: 'warning', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' };
      default: return { name: 'information-circle', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' };
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getTypeIcon(item.type);
    return (
      <TouchableOpacity
        style={[s.notifCard, !item.is_read && s.notifUnread]}
        activeOpacity={0.7}
        onPress={() => markAsRead(item.id)}
      >
        <View style={[s.notifIcon, { backgroundColor: icon.bg }]}>
          <Ionicons name={icon.name as any} size={22} color={icon.color} />
        </View>
        <View style={s.notifContent}>
          <Text style={[s.notifTitle, !item.is_read && s.notifTitleBold]} numberOfLines={1}>{item.title}</Text>
          <Text style={s.notifMessage} numberOfLines={2}>{item.message}</Text>
          <Text style={s.notifTime}>{timeAgo(item.created_at)}</Text>
        </View>
        {!item.is_read && <View style={s.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={s.emptyState}>
      <View style={s.emptyIcon}>
        <Ionicons name="notifications-off-outline" size={40} color="#D1D5DB" />
      </View>
      <Text style={s.emptyTitle}>
        {!user ? 'Đăng nhập để xem thông báo' : 'Chưa có thông báo'}
      </Text>
      <Text style={s.emptySubtitle}>
        {!user
          ? 'Bạn cần đăng nhập để nhận thông báo từ RedWork.'
          : 'Khi có ứng tuyển mới hoặc tin nhắn, bạn sẽ thấy ở đây.'}
      </Text>
    </View>
  );

  const SkeletonCard = () => (
    <View style={[s.notifCard, { opacity: 0.4 }]}>
      <View style={[s.notifIcon, { backgroundColor: '#E5E7EB' }]} />
      <View style={s.notifContent}>
        <View style={{ width: 150, height: 14, backgroundColor: '#E5E7EB', borderRadius: 6 }} />
        <View style={{ width: '80%', height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, marginTop: 6 }} />
        <View style={{ width: 60, height: 10, backgroundColor: '#E5E7EB', borderRadius: 6, marginTop: 6 }} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.headerSection}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerLabel}>Inbox</Text>
            <Text style={s.headerTitle}>Thông báo</Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity style={s.markAllBtn} onPress={markAllAsRead}>
              <Ionicons name="checkmark-done" size={16} color="#FF4444" />
              <Text style={s.markAllText}>Đọc tất cả</Text>
            </TouchableOpacity>
          )}
        </View>
        {unreadCount > 0 && (
          <View style={s.unreadBanner}>
            <Text style={s.unreadBannerText}>{unreadCount} thông báo chưa đọc</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 0 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : notifications.length === 0 || !user ? (
        <EmptyState />
      ) : (
        <FlashList
          data={notifications}
          renderItem={renderNotification}
          estimatedItemSize={90}
          contentContainerStyle={{ paddingBottom: 100 }}
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerLabel: { fontSize: 12, fontWeight: '500', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 2 },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#1A237E', letterSpacing: -0.5 },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,68,68,0.08)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  markAllText: { fontSize: 12, fontWeight: '600', color: '#FF4444' },

  unreadBanner: { backgroundColor: 'rgba(255,68,68,0.06)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginTop: 10 },
  unreadBannerText: { fontSize: 13, color: '#FF4444', fontWeight: '600', textAlign: 'center' },

  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 24,
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB', gap: 12,
  },
  notifUnread: { backgroundColor: 'rgba(59,130,246,0.03)' },
  notifIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: '500', color: '#1A237E', marginBottom: 3 },
  notifTitleBold: { fontWeight: '700' },
  notifMessage: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  notifTime: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4444', marginTop: 6 },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyIcon: { width: 80, height: 80, backgroundColor: '#F3F4F6', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#9CA3AF', textAlign: 'center' },
  emptySubtitle: { color: '#9CA3AF', marginTop: 8, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },
});
