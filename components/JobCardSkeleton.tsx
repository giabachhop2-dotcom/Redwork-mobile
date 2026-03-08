import React from 'react';
import { View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const JobCardSkeleton = () => {
  const isDark = useColorScheme() === 'dark';
  const bg = isDark ? '#2C2C2E' : '#F3F4F6';

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: isDark ? '#2C2C2E' : '#F0F0F0',
      }}
    >
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: bg }} />
        <View style={{ flex: 1, gap: 8 }}>
          <View style={{ height: 16, borderRadius: 8, width: '80%', backgroundColor: bg }} />
          <View style={{ height: 12, borderRadius: 6, width: '50%', backgroundColor: bg }} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        <View style={{ height: 28, width: 70, borderRadius: 8, backgroundColor: bg }} />
        <View style={{ height: 28, width: 80, borderRadius: 8, backgroundColor: bg }} />
        <View style={{ height: 28, width: 90, borderRadius: 8, backgroundColor: bg }} />
      </View>
      <View style={{ marginTop: 14 }}>
        <View style={{ height: 10, width: 80, borderRadius: 5, backgroundColor: bg }} />
      </View>
    </View>
  );
};
