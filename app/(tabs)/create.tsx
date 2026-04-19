import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, ScrollView, Animated } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SERVICES = [
  { id: 'Sửa chữa', title: 'Sửa chữa', icon: 'hammer' },
  { id: 'Vận chuyển', title: 'Vận chuyển', icon: 'car' },
  { id: 'Dọn dẹp', title: 'Dọn dẹp', icon: 'water' },
  { id: 'Điện lạnh', title: 'Điện lạnh', icon: 'snow' },
  { id: 'Khác', title: 'Khác', icon: 'ellipsis-horizontal' }
];

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://redwork.work/api';

export default function CreateJobScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedService, setSelectedService] = useState('Sửa chữa');
  const [budget, setBudget] = useState('');
  const [details, setDetails] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const mapRef = useRef<MapView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  useEffect(() => {
    if (isSearching) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSearching]);

  const handleCreate = async () => {
    if (!location) {
      alert('Đang lấy vị trí GPS, vui lòng đợi...');
      return;
    }

    setIsSearching(true);

    try {
      const res = await fetch(`${API_URL}/mobile/jobs/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Cần thợ ${selectedService.toLowerCase()}`,
          service_id: selectedService,
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          budget: budget || '0',
          details: details
        })
      });

      const data = await res.json();
      
      if (data.success) {
        // Nghỉ 2 giây để user thấy hiệu ứng Radar tìm thợ
        setTimeout(() => {
          setIsSearching(false);
          alert('Đã phát sóng Job tới các thợ xung quanh!');
          setDetails('');
          setBudget('');
        }, 2000);
      } else {
        setIsSearching(false);
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      setIsSearching(false);
      alert('Không thể kết nối đến máy chủ');
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        showsUserLocation={true}
        showsMyLocationButton={false}
        initialRegion={{
          latitude: location?.coords.latitude || 10.762622,
          longitude: location?.coords.longitude || 106.660172,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Destination Pin */}
        {location && (
          <Marker coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}>
            <View className="bg-navy p-3 rounded-full border-2 border-white shadow-lg">
              <Ionicons name="location" size={24} color="white" />
            </View>
          </Marker>
        )}
      </MapView>

      <BlurView intensity={80} tint="light" className="absolute top-0 left-0 right-0 z-10 pt-16 pb-4 px-6 rounded-b-3xl">
        <Text className="text-3xl font-extrabold text-navy tracking-tight">Gọi Thợ Nhanh</Text>
        <Text className="text-gray-500 font-medium mt-1">Hệ thống sẽ tìm thợ gần bạn nhất</Text>
      </BlurView>

      {/* Locate Me Button */}
      <TouchableOpacity 
        className="absolute bottom-96 mb-8 right-6 bg-white w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => {
          if (location) {
            mapRef.current?.animateToRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }}
      >
        <Ionicons name="locate" size={28} color="#000" />
      </TouchableOpacity>

      {/* Creation Bottom Sheet */}
      <View style={styles.bottomSheet} className="bg-white rounded-t-3xl shadow-2xl px-6 pt-6 pb-24">
        {isSearching ? (
          <View className="items-center justify-center py-10">
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }} className="bg-red-100 w-32 h-32 rounded-full absolute items-center justify-center">
              <View className="bg-red-200 w-24 h-24 rounded-full absolute" />
            </Animated.View>
            <View className="bg-red-500 w-16 h-16 rounded-full items-center justify-center z-10 shadow-lg shadow-red-500/50">
              <Ionicons name="search" size={32} color="white" />
            </View>
            <Text className="text-xl font-bold text-navy mt-8">Đang tìm thợ quanh bạn...</Text>
            <Text className="text-gray-500 mt-2">Vui lòng không đóng ứng dụng</Text>
            <TouchableOpacity onPress={() => setIsSearching(false)} className="mt-8 bg-gray-100 px-6 py-3 rounded-full">
              <Text className="font-bold text-gray-600">Hủy</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Services */}
            <Text className="text-lg font-bold text-navy mb-3">Dịch vụ bạn cần?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
              {SERVICES.map((s) => (
                <TouchableOpacity 
                  key={s.id} 
                  onPress={() => setSelectedService(s.id)}
                  className={`mr-4 items-center justify-center p-4 rounded-2xl border ${selectedService === s.id ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200'}`}
                  style={{ width: 90 }}
                >
                  <Ionicons name={s.icon as any} size={28} color={selectedService === s.id ? '#EF4444' : '#6B7280'} />
                  <Text className={`mt-2 font-medium text-xs ${selectedService === s.id ? 'text-red-600' : 'text-gray-500'}`}>{s.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Vị trí */}
            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-700 mb-2">Vị trí hiện tại</Text>
              <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 border border-gray-200">
                <Ionicons name="location" size={20} color="#EF4444" />
                <Text className="ml-2 text-navy font-medium flex-1">Đang lấy vị trí GPS...</Text>
              </View>
            </View>

            {/* Chi tiết & Giá */}
            <View className="flex-row space-x-4 mb-6">
              <View className="flex-1 pr-2">
                <Text className="text-sm font-bold text-gray-700 mb-2">Mô tả ngắn</Text>
                <TextInput 
                  placeholder="Vd: Sửa ống nước bồn cầu"
                  value={details}
                  onChangeText={setDetails}
                  className="bg-gray-100 rounded-xl px-4 py-3 text-navy border border-gray-200"
                />
              </View>
              <View className="flex-1 pl-2">
                <Text className="text-sm font-bold text-gray-700 mb-2">Ngân sách (VNĐ)</Text>
                <TextInput 
                  placeholder="500.000"
                  keyboardType="numeric"
                  value={budget}
                  onChangeText={setBudget}
                  className="bg-gray-100 rounded-xl px-4 py-3 text-navy border border-gray-200 font-bold"
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleCreate}
              className="bg-red-500 h-14 rounded-2xl items-center justify-center shadow-lg shadow-red-500/40"
            >
              <Text className="text-white font-extrabold text-lg tracking-wide">TÌM THỢ NGAY</Text>
            </TouchableOpacity>
          </ScrollView>
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
    maxHeight: height * 0.6,
  }
});
