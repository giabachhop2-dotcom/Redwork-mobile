import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function TrackingScreen() {
  const [step, setStep] = useState(1); // 1: Thợ đang đến, 2: Đang làm việc, 3: Đã xong
  const mapRef = useRef<MapView>(null);

  // Mock locations for routing
  const renterLoc = { latitude: 10.762622, longitude: 106.660172 };
  const workerLoc = { latitude: 10.772622, longitude: 106.670172 };

  return (
    <View style={styles.container}>
      {/* Background Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: (renterLoc.latitude + workerLoc.latitude) / 2,
          longitude: (renterLoc.longitude + workerLoc.longitude) / 2,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
      >
        <Marker coordinate={renterLoc}>
          <View className="bg-navy p-2 rounded-full border-2 border-white">
            <Ionicons name="home" size={20} color="white" />
          </View>
        </Marker>
        <Marker coordinate={workerLoc}>
          <View className="bg-red-500 p-2 rounded-full border-2 border-white">
            <Ionicons name="bicycle" size={20} color="white" />
          </View>
        </Marker>
        {/* Mock Route Line */}
        <Polyline 
          coordinates={[workerLoc, { latitude: 10.768, longitude: 106.665 }, renterLoc]} 
          strokeColor="#EF4444" 
          strokeWidth={4} 
          lineDashPattern={[10, 10]}
        />
      </MapView>

      <SafeAreaView className="absolute top-0 left-0 right-0 px-4">
        <TouchableOpacity onPress={() => router.back()} className="bg-white/90 w-12 h-12 rounded-full items-center justify-center shadow-md">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Tracking Bottom Sheet */}
      <View style={styles.bottomSheet} className="bg-white rounded-t-3xl shadow-2xl px-6 pt-6 pb-12">
        <View className="flex-row items-center mb-6">
          <View className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden mr-4">
            {/* Fake Avatar */}
            <View className="flex-1 bg-gray-300" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-navy">Nguyễn Văn A</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text className="text-gray-600 font-medium ml-1">4.9 (120 chuyến)</Text>
            </View>
          </View>
          <TouchableOpacity className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
            <Ionicons name="call" size={24} color="#10B981" />
          </TouchableOpacity>
        </View>

        <View className="bg-gray-50 p-4 rounded-2xl mb-6">
          <Text className="text-gray-500 font-medium text-sm mb-1">Trạng thái hiện tại</Text>
          <Text className="text-lg font-bold text-navy">
            {step === 1 && "Thợ đang di chuyển đến..."}
            {step === 2 && "Thợ đang tiến hành sửa chữa"}
            {step === 3 && "Công việc đã hoàn thành!"}
          </Text>
        </View>

        {step === 1 && (
          <TouchableOpacity onPress={() => setStep(2)} className="bg-navy py-4 rounded-xl items-center">
            <Text className="text-white font-bold text-lg">Đã tới nơi (Test)</Text>
          </TouchableOpacity>
        )}
        
        {step === 2 && (
          <TouchableOpacity onPress={() => setStep(3)} className="bg-blue-600 py-4 rounded-xl items-center">
            <Text className="text-white font-bold text-lg">Báo cáo Hoàn thành (Test)</Text>
          </TouchableOpacity>
        )}

        {step === 3 && (
          <View>
            <View className="bg-green-100 p-4 rounded-2xl mb-4 items-center">
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              <Text className="text-green-700 font-bold text-lg mt-2">Đã giải ngân 500,000đ</Text>
            </View>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/')} className="bg-red-500 py-4 rounded-xl items-center">
              <Text className="text-white font-bold text-lg">Đánh giá Thợ</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: '100%', height: '100%' },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  }
});
