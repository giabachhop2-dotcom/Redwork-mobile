import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function MessagesScreen() {
  return (
    <SafeAreaView style={s.container}>
      <View style={s.headerSection}>
        <Text style={s.headerLabel}>Inbox</Text>
        <Text style={s.headerTitle}>Messages</Text>
      </View>
      <View style={s.emptyContent}>
        <View style={s.emptyIcon}>
          <Ionicons name="chatbubbles-outline" size={40} color="#D1D5DB" />
        </View>
        <Text style={s.emptyTitle}>No Messages Yet</Text>
        <Text style={s.emptySubtitle}>
          When you apply to jobs or get contacted by employers, your conversations will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerSection: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerLabel: { fontSize: 12, fontWeight: '500', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 2 },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#1A237E', letterSpacing: -0.5 },
  emptyContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, backgroundColor: '#F3F4F6', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#9CA3AF', textAlign: 'center' },
  emptySubtitle: { color: '#9CA3AF', marginTop: 8, textAlign: 'center', lineHeight: 20 },
});
