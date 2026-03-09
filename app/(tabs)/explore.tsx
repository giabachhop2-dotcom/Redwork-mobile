import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = ['All', 'Remote', 'Full-time', 'Part-time', 'Contract', 'Tech', 'Design', 'Marketing'];

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="px-6 pt-4 pb-3">
        <Text className="text-sm font-medium text-gray-500 uppercase tracking-widest">Browse</Text>
        <Text className="text-3xl font-extrabold text-navy dark:text-white tracking-tight">Explore</Text>
      </View>

      {/* Search */}
      <View className="px-6 mb-4">
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-base text-navy dark:text-white"
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
            className={`px-4 py-2 rounded-full ${selectedCat === item ? 'bg-primary' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            <Text className={`font-semibold text-sm ${selectedCat === item ? 'text-white' : 'text-gray-500'}`}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Content */}
      <View className="flex-1 justify-center items-center px-8">
        <View className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-4">
          <Ionicons name="compass-outline" size={40} color="#D1D5DB" />
        </View>
        <Text className="text-xl font-bold text-gray-400 text-center">Explore Coming Soon</Text>
        <Text className="text-gray-400 mt-2 text-center">
          Discover new opportunities, top companies, and trending skills on RedWork.
        </Text>
      </View>
    </SafeAreaView>
  );
}
