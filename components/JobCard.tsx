import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Job } from '../../types/database';

interface JobCardProps {
  job: Job;
  onPress: () => void;
}

export const JobCard = ({ job, onPress }: JobCardProps) => {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      className="bg-white dark:bg-gray-900 mx-4 mb-4 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-row gap-3 flex-1">
          <Image
            source={job.logo_url || 'https://ui-avatars.com/api/?name=' + job.company}
            style={{ width: 48, height: 48, borderRadius: 12 }}
            contentFit="cover"
            transition={200}
          />
          <View className="flex-1">
            <Text className="font-bold text-lg text-navy dark:text-white" numberOfLines={1}>
              {job.title}
            </Text>
            <Text className="text-gray-500 text-sm">{job.company}</Text>
          </View>
        </View>
        <TouchableOpacity>
             <Ionicons name="bookmark-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        <View className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            <Text className="text-xs text-gray-600 dark:text-gray-300">{job.type}</Text>
        </View>
        <View className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            <Text className="text-xs text-gray-600 dark:text-gray-300">{job.location}</Text>
        </View>
        {job.budget_max && (
             <View className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                <Text className="text-xs text-green-700 dark:text-green-400 font-medium">
                    ${job.budget_min} - ${job.budget_max}
                </Text>
            </View>
        )}
      </View>

      <View className="mt-4 flex-row justify-between items-center">
        <Text className="text-xs text-gray-400">Posted 2h ago</Text>
      </View>
    </TouchableOpacity>
  );
};
