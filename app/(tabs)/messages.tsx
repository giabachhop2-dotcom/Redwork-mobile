import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Platform, FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

// Placeholder conversations until real messaging is wired
const PLACEHOLDER_CONVERSATIONS: Conversation[] = [];

export default function MessagesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const router = useRouter();
  const [conversations] = useState<Conversation[]>(PLACEHOLDER_CONVERSATIONS);

  if (!user) {
    return (
      <View style={{
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: isDark ? '#000' : '#F2F2F7',
        paddingHorizontal: 40,
      }}>
        <Ionicons name="chatbubbles-outline" size={80} color="#9CA3AF" />
        <Text style={{
          fontSize: 22, fontWeight: '700',
          color: isDark ? '#FFF' : '#000', marginTop: 20,
        }}>
          Sign in to message
        </Text>
        <Text style={{
          fontSize: 15, color: '#9CA3AF',
          textAlign: 'center', marginTop: 8, lineHeight: 22,
        }}>
          Connect with employers and discuss opportunities directly.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/login')}
          style={{
            backgroundColor: '#FF4444',
            paddingHorizontal: 32, paddingVertical: 14,
            borderRadius: 14, marginTop: 24,
            shadowColor: '#FF4444',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3, shadowRadius: 8,
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#F2F2F7' }}>
      {/* Header */}
      <View style={{
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(242,242,247,0.95)',
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{
            fontSize: 32, fontWeight: '800',
            color: isDark ? '#FFF' : '#000',
            letterSpacing: -0.5,
          }}>
            Messages
          </Text>
          <TouchableOpacity
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: isDark ? '#1C1C1E' : '#FFF',
              justifyContent: 'center', alignItems: 'center',
              borderWidth: 1, borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
            }}
          >
            <Ionicons name="create-outline" size={22} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>
        </View>
      </View>

      {conversations.length === 0 ? (
        /* Empty State */
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center',
          paddingHorizontal: 40,
        }}>
          <Animated.View entering={FadeInDown.springify()} style={{ alignItems: 'center' }}>
            <View style={{
              width: 100, height: 100, borderRadius: 30,
              backgroundColor: isDark ? '#1C1C1E' : '#FFF',
              justifyContent: 'center', alignItems: 'center',
              borderWidth: 1, borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
              marginBottom: 20,
            }}>
              <Ionicons name="chatbubbles" size={48} color="#FF4444" />
            </View>
            <Text style={{
              fontSize: 22, fontWeight: '700',
              color: isDark ? '#FFF' : '#000',
            }}>
              No messages yet
            </Text>
            <Text style={{
              fontSize: 15, color: '#9CA3AF',
              textAlign: 'center', marginTop: 8, lineHeight: 22,
            }}>
              When you apply for jobs, your conversations with employers will appear here.
            </Text>
          </Animated.View>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => Haptics.selectionAsync()}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                  paddingHorizontal: 20, paddingVertical: 14,
                  backgroundColor: isDark ? '#000' : '#F2F2F7',
                }}
              >
                <View>
                  {item.avatar ? (
                    <Image
                      source={item.avatar}
                      style={{ width: 52, height: 52, borderRadius: 18 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={{
                      width: 52, height: 52, borderRadius: 18,
                      backgroundColor: '#FF4444',
                      justifyContent: 'center', alignItems: 'center',
                    }}>
                      <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>
                        {item.name[0]}
                      </Text>
                    </View>
                  )}
                  {item.online && (
                    <View style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 14, height: 14, borderRadius: 7,
                      backgroundColor: '#10B981',
                      borderWidth: 2, borderColor: isDark ? '#000' : '#F2F2F7',
                    }} />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{
                      fontSize: 16, fontWeight: item.unread > 0 ? '700' : '500',
                      color: isDark ? '#FFF' : '#1A1A1A',
                    }}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#9CA3AF' }}>{item.timestamp}</Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 14, marginTop: 3,
                      color: item.unread > 0 ? (isDark ? '#FFF' : '#1A1A1A') : '#9CA3AF',
                      fontWeight: item.unread > 0 ? '500' : '400',
                    }}
                    numberOfLines={1}
                  >
                    {item.lastMessage}
                  </Text>
                </View>

                {item.unread > 0 && (
                  <View style={{
                    backgroundColor: '#FF4444',
                    minWidth: 22, height: 22, borderRadius: 11,
                    justifyContent: 'center', alignItems: 'center',
                    paddingHorizontal: 6,
                  }}>
                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>{item.unread}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}
