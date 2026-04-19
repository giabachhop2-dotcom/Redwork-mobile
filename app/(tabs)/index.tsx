import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Switch } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Job } from '@/types/database';

const { width, height } = Dimensions.get('window');

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://redwork.work/api';

export default function RadarMapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const fetchJobs = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`${API_URL}/mobile/jobs?lat=${lat}&lng=${lng}&limit=20`);
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Lỗi khi tải jobs:', error);
    }
  };

  useEffect(() => {
    if (isOnline && location) {
      // Fetch initial jobs
      fetchJobs(location.coords.latitude, location.coords.longitude);
      
      // Auto-refresh every 15 seconds
      const interval = setInterval(() => {
        fetchJobs(location.coords.latitude, location.coords.longitude);
      }, 15000);
      
      return () => clearInterval(interval);
    } else {
      setJobs([]); // Clear jobs when offline
    }
  }, [isOnline, location]);

  const handleMarkerPress = (job: any) => {
    setSelectedJob(job);
    // Pan to marker
    mapRef.current?.animateToRegion({
      latitude: job.lat,
      longitude: job.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    // Slide up bottom sheet
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 8,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setSelectedJob(null));
  };

  return (
    <View style={styles.container}>
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
        {isOnline && jobs.map((job) => {
          if (!job.lat || !job.lng) return null;
          return (
            <Marker
              key={job.id}
              coordinate={{ latitude: job.lat, longitude: job.lng }}
              onPress={() => handleMarkerPress(job)}
            >
              <View className="bg-red-500 rounded-full w-12 h-12 items-center justify-center border-4 border-white shadow-lg">
                <Ionicons name="briefcase" size={20} color="white" />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Header / Radar Toggle */}
      <BlurView intensity={80} tint="light" className="absolute top-0 left-0 right-0 z-10 pt-16 pb-4 px-6 rounded-b-3xl overflow-hidden">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-extrabold text-navy tracking-tight">Radar</Text>
            <Text className="text-sm font-medium text-gray-500">{isOnline ? 'Đang quét job xung quanh...' : 'Đang nghỉ ngơi'}</Text>
          </View>
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
            <Text className={`font-bold mr-3 ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: '#D1D5DB', true: '#34D399' }}
              thumbColor={isOnline ? '#10B981' : '#F3F4F6'}
            />
          </View>
        </View>
      </BlurView>

      {/* Locate Me Button */}
      <TouchableOpacity 
        className="absolute bottom-32 right-6 bg-white w-14 h-14 rounded-full items-center justify-center shadow-lg"
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

      {/* Job Details Bottom Sheet */}
      <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]} className="bg-white rounded-t-3xl shadow-2xl px-6 pt-6 pb-12">
        {selectedJob && (
          <View>
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1 pr-4">
                <View className="bg-red-100 self-start px-3 py-1 rounded-full mb-2">
                  <Text className="text-red-600 font-bold text-xs">Cách {Number(selectedJob.distance_km || 0).toFixed(1)} km</Text>
                </View>
                <Text className="text-2xl font-extrabold text-navy">{selectedJob.title}</Text>
              </View>
              <TouchableOpacity onPress={closeSheet} className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between items-center bg-gray-50 rounded-2xl p-4 mb-6">
              <View>
                <Text className="text-gray-500 text-sm mb-1">Thu nhập (dự kiến)</Text>
                <Text className="text-xl font-black text-green-600">
                  {selectedJob.budget_max ? `${selectedJob.budget_max}đ` : 'Thỏa thuận'}
                </Text>
              </View>
              <Ionicons name="cash-outline" size={32} color="#10B981" />
            </View>

            {/* Swipe to Accept button simulation */}
            <TouchableOpacity className="bg-navy h-16 rounded-full items-center justify-center flex-row shadow-lg shadow-navy/30">
              <Text className="text-white font-bold text-lg mr-2">Trượt để nhận Job</Text>
              <Ionicons name="arrow-forward" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
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
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  }
});
