import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = ['All', 'Remote', 'Full-time', 'Part-time', 'Contract', 'Tech', 'Design', 'Marketing'];

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  return (
    <SafeAreaView style={s.container}>
      <View style={s.headerSection}>
        <Text style={s.headerLabel}>Browse</Text>
        <Text style={s.headerTitle}>Explore</Text>
      </View>

      {/* Search */}
      <View style={s.searchSection}>
        <View style={s.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={s.searchInput}
            placeholder="Search skills, titles, companies..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8, marginBottom: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCat(item)}
            style={[s.chip, selectedCat === item && s.chipActive]}
          >
            <Text style={[s.chipText, selectedCat === item && s.chipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Content */}
      <View style={s.emptyContent}>
        <View style={s.emptyIcon}>
          <Ionicons name="compass-outline" size={40} color="#D1D5DB" />
        </View>
        <Text style={s.emptyTitle}>Explore Coming Soon</Text>
        <Text style={s.emptySubtitle}>
          Discover new opportunities, top companies, and trending skills on RedWork.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerSection: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  headerLabel: { fontSize: 12, fontWeight: '500', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 2 },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#1A237E', letterSpacing: -0.5 },
  searchSection: { paddingHorizontal: 24, marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#1A237E' },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F3F4F6' },
  chipActive: { backgroundColor: '#FF4444' },
  chipText: { fontWeight: '600', fontSize: 13, color: '#6B7280' },
  chipTextActive: { color: '#FFFFFF' },
  emptyContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, backgroundColor: '#F3F4F6', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#9CA3AF', textAlign: 'center' },
  emptySubtitle: { color: '#9CA3AF', marginTop: 8, textAlign: 'center', lineHeight: 20 },
});
