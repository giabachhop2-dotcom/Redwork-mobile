import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function MessagesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="px-6 pt-4 pb-3 border-b border-gray-200/50 dark:border-gray-800/50">
        <Text className="text-sm font-medium text-gray-500 uppercase tracking-widest">Inbox</Text>
        <Text className="text-3xl font-extrabold text-navy dark:text-white tracking-tight">Messages</Text>
      </View>
      <View className="flex-1 justify-center items-center px-8">
        <View className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-4">
          <Ionicons name="chatbubbles-outline" size={40} color="#D1D5DB" />
        </View>
        <Text className="text-xl font-bold text-gray-400 text-center">No Messages Yet</Text>
        <Text className="text-gray-400 mt-2 text-center">
          When you apply to jobs or get contacted by employers, your conversations will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}
