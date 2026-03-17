import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../utils/supabase';

interface NetworkStats {
  online_nodes: number;
  total_nodes: number;
  tasks_completed: number;
  total_rnp_distributed: number;
}

interface UserBalance {
  total_rnp: number;
  tasks_rewarded: number;
  uptime_rewards: number;
}

export default function NetworkScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<NetworkStats>({
    online_nodes: 0,
    total_nodes: 0,
    tasks_completed: 0,
    total_rnp_distributed: 0,
  });
  const [balance, setBalance] = useState<UserBalance | null>(null);

  const fetchData = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      // Fetch network stats
      const { data: nodes } = await supabase
        .from('rednet_nodes')
        .select('id, status');

      if (nodes) {
        const onlineCount = nodes.filter((n: any) => n.status === 'online').length;
        setStats(prev => ({
          ...prev,
          online_nodes: onlineCount,
          total_nodes: nodes.length,
        }));
      }

      // Fetch completed tasks count
      const { count: tasksCount } = await supabase
        .from('rednet_tasks')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed');

      if (tasksCount !== null) {
        setStats(prev => ({ ...prev, tasks_completed: tasksCount }));
      }

      // Fetch user balance if logged in
      if (currentUser) {
        const { data: balanceData } = await supabase
          .from('rednet_points')
          .select('amount, reason')
          .eq('user_id', currentUser.id);

        if (balanceData) {
          const total = balanceData.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          const taskRewards = balanceData.filter((t: any) => t.reason === 'task_completed').reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          const uptimeRewards = balanceData.filter((t: any) => t.reason === 'uptime').reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          setBalance({ total_rnp: total, tasks_rewarded: taskRewards, uptime_rewards: uptimeRewards });
        }
      }
    } catch (e) {
      console.warn('Failed to fetch network data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF4444" />}
      >
        {/* Header */}
        <View style={s.headerSection}>
          <Text style={s.headerLabel}>RedNet</Text>
          <Text style={s.headerTitle}>Mạng lưới</Text>
          <Text style={s.headerSubtitle}>
            Chia sẻ phần cứng. Kiếm điểm RNP.
          </Text>
        </View>

        {/* Network Stats */}
        <View style={s.statsGrid}>
          <StatBox icon="globe-outline" label="Nodes trực tuyến" value={stats.online_nodes} color="#22C55E" />
          <StatBox icon="hardware-chip-outline" label="Tổng nodes" value={stats.total_nodes} color="#3B82F6" />
          <StatBox icon="flash-outline" label="Tasks hoàn thành" value={stats.tasks_completed} color="#F59E0B" />
          <StatBox icon="trophy-outline" label="Tổng RNP" value={stats.total_rnp_distributed} color="#A855F7" />
        </View>

        {/* User Balance (if logged in) */}
        {user && balance && (
          <View style={s.balanceSection}>
            <Text style={s.sectionTitle}>Số dư của bạn</Text>
            <View style={s.balanceCard}>
              <View style={s.balanceRow}>
                <Text style={s.balanceLabel}>💰 Tổng RNP</Text>
                <Text style={s.balanceValue}>{balance.total_rnp.toFixed(1)}</Text>
              </View>
              <View style={s.balanceDivider} />
              <View style={s.balanceRow}>
                <Text style={s.balanceLabel}>✅ Thưởng Tasks</Text>
                <Text style={s.balanceValueSmall}>{balance.tasks_rewarded.toFixed(1)}</Text>
              </View>
              <View style={s.balanceDivider} />
              <View style={s.balanceRow}>
                <Text style={s.balanceLabel}>⏱️ Thưởng Uptime</Text>
                <Text style={s.balanceValueSmall}>{balance.uptime_rewards.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tier System */}
        <View style={s.tierSection}>
          <Text style={s.sectionTitle}>Bậc phần cứng</Text>
          <TierCard emoji="💻" tier="LITE" specs="4 cores, 8GB RAM" multiplier="×1.0" />
          <TierCard emoji="🖥️" tier="STANDARD" specs="4+ cores, 8GB+ RAM" multiplier="×2.5" />
          <TierCard emoji="⚡" tier="PRO" specs="8+ cores, 16GB+ RAM, GPU 6GB+" multiplier="×5.0" highlight />
        </View>

        {/* CTA */}
        {!user && (
          <View style={s.ctaSection}>
            <TouchableOpacity
              style={s.ctaButton}
              onPress={() => Linking.openURL('https://redwork.work/login')}
            >
              <Text style={s.ctaText}>Đăng nhập để tham gia</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <View style={s.statBox}>
      <View style={s.statIconRow}>
        <Ionicons name={icon as any} size={18} color={color} />
        <Text style={s.statLabel}>{label}</Text>
      </View>
      <Text style={[s.statValue, { color }]}>{value}</Text>
    </View>
  );
}

function TierCard({ emoji, tier, specs, multiplier, highlight }: { emoji: string; tier: string; specs: string; multiplier: string; highlight?: boolean }) {
  return (
    <View style={[s.tierCard, highlight && s.tierCardHighlight]}>
      {highlight && <Text style={s.tierBadge}>Thưởng cao nhất</Text>}
      <Text style={s.tierEmoji}>{emoji}</Text>
      <View style={s.tierInfo}>
        <Text style={s.tierName}>{tier}</Text>
        <Text style={s.tierSpecs}>{specs}</Text>
      </View>
      <Text style={s.tierMultiplier}>{multiplier}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  headerSection: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 },
  headerLabel: { fontSize: 12, fontWeight: '500', color: '#FF4444', textTransform: 'uppercase', letterSpacing: 2 },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 8, marginBottom: 24 },
  statBox: {
    width: '48%', backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#262626', flexGrow: 1, flexBasis: '45%',
  },
  statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  statLabel: { fontSize: 12, color: '#6B7280' },
  statValue: { fontSize: 28, fontWeight: '800' },

  balanceSection: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  balanceCard: { backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#262626' },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  balanceLabel: { fontSize: 14, color: '#9CA3AF' },
  balanceValue: { fontSize: 28, fontWeight: '800', color: '#FBBF24' },
  balanceValueSmall: { fontSize: 20, fontWeight: '700', color: '#D1D5DB' },
  balanceDivider: { height: 1, backgroundColor: '#262626' },

  tierSection: { paddingHorizontal: 24, marginBottom: 24 },
  tierCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A',
    borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#262626',
  },
  tierCardHighlight: { borderColor: '#F59E0B', borderWidth: 2 },
  tierBadge: { position: 'absolute', top: -10, left: 16, backgroundColor: '#F59E0B', color: '#000', fontSize: 10, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  tierEmoji: { fontSize: 28, marginRight: 12 },
  tierInfo: { flex: 1 },
  tierName: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  tierSpecs: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  tierMultiplier: { fontSize: 20, fontWeight: '800', color: '#FBBF24' },

  ctaSection: { paddingHorizontal: 24, marginBottom: 24 },
  ctaButton: {
    backgroundColor: '#FF4444', borderRadius: 16, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#FF4444', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  ctaText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
